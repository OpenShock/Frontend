#!/usr/bin/env python3
"""
Pin every GitHub Action referenced in .github/workflows/*.yml to the full commit
SHA that its version tag currently resolves to, keeping the tag as a trailing
comment (e.g. `uses: actions/checkout@<sha> # v6`).

Pinning to an immutable SHA stops a compromised or retagged action from silently
running new code in our pipelines, while the trailing comment keeps the intended
version readable and lets Dependabot keep bumping it.

The script is re-runnable: for entries that are already pinned it re-resolves the
SHA from the trailing-comment tag, so running it again simply refreshes the SHAs.

With --latest, each action is first upgraded to its newest published release tag
(falling back to the tag already in the file if the action has no releases), so
the script doubles as an updater.

Requires the `gh` CLI (authenticated) and `git`.

Usage:
    python .github/pin_actions.py            # re-pin to the current tags
    python .github/pin_actions.py --latest   # upgrade to latest releases, then pin
"""

import argparse
import re
import subprocess
import sys
import pathlib

# matches `[- ]uses: owner/repo@ref` with an optional trailing `# tag` comment
USES_RE = re.compile(
    r'^(?P<pre>\s*-?\s*uses:\s*)(?P<action>[^@\s]+)@(?P<ref>\S+)(?P<rest>.*)$'
)
COMMENT_TAG_RE = re.compile(r'#\s*(?P<tag>\S+)')
SHA_RE = re.compile(r'^[0-9a-f]{40}$')

_sha_cache: dict[tuple[str, str], str] = {}
_latest_cache: dict[str, str | None] = {}


def resolve_sha( action: str, tag: str ) -> str:

    key = ( action, tag )

    if key not in _sha_cache:

        # actions may reference a subdirectory (owner/repo/path); the API wants owner/repo
        repo = '/'.join( action.split( '/' )[ :2 ] )

        _sha_cache[ key ] = subprocess.check_output(
            [ 'gh', 'api', f'repos/{repo}/commits/{tag}', '--jq', '.sha' ],
            text = True
        ).strip()


    return _sha_cache[ key ]


def latest_tag( action: str ) -> str | None:

    if action not in _latest_cache:

        try:

            repo = '/'.join( action.split( '/' )[ :2 ] )

            tag = subprocess.run(
                [ 'gh', 'api', f'repos/{repo}/releases/latest', '--jq', '.tag_name' ],
                capture_output = True, text = True, check = True
            ).stdout.strip()

            _latest_cache[ action ] = tag or None

        except subprocess.CalledProcessError:

            # no published releases (or no access); caller falls back to the existing tag
            _latest_cache[ action ] = None



    return _latest_cache[ action ]


def pin_line( line: str, use_latest: bool ) -> str:

    m = USES_RE.match( line )

    if m is None:

        return line


    action = m[ 'action' ]
    ref = m[ 'ref' ]
    rest = m[ 'rest' ]

    comment = COMMENT_TAG_RE.search( rest )

    if SHA_RE.match( ref ):

        # already pinned; the intended version lives in the `# tag` comment
        current_tag = comment[ 'tag' ] if comment is not None else None

    else:

        current_tag = ref


    if use_latest:

        tag = latest_tag( action ) or current_tag

    else:

        tag = current_tag


    if tag is None:

        # pinned to a bare SHA with no comment and nothing to upgrade to; leave it be
        return line


    sha = resolve_sha( action, tag )

    print( f'{action}@{tag} -> {sha}' )

    return f'{m[ "pre" ]}{action}@{sha} # {tag}'


def main() -> int:

    parser = argparse.ArgumentParser( description = 'Pin GitHub Actions in our workflows to commit SHAs.' )
    parser.add_argument(
        '--latest', action = 'store_true',
        help = 'upgrade each action to its newest published release tag before pinning'
    )
    args = parser.parse_args()

    root = pathlib.Path(
        subprocess.check_output( [ 'git', 'rev-parse', '--show-toplevel' ], text = True ).strip()
    )

    workflow_dir = root / '.github' / 'workflows'

    for path in sorted( workflow_dir.glob( '*.yml' ) ):

        original = path.read_text( encoding = 'utf-8' )

        newline = '\r\n' if '\r\n' in original else '\n'

        lines = original.splitlines()

        pinned = [ pin_line( line, args.latest ) for line in lines ]

        updated = newline.join( pinned )

        if original.endswith( ( '\n', '\r' ) ):

            updated += newline


        if updated != original:

            path.write_text( updated, encoding = 'utf-8', newline = '' )



    return 0


if __name__ == '__main__':

    sys.exit( main() )
