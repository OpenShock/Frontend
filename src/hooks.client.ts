import { metaApi } from "$lib/api";

export async function init() {
    const response = await metaApi.versionGetBackendVersion();
    if (!response.data) throw new Error("Failed to fetch backend info");
    
    if (response.data.version) {
        sessionStorage.setItem("backendVersion", response.data.version);
    }
    if (response.data.commit) {
        sessionStorage.setItem("backendCommit", response.data.commit);
    }
    if (response.data.shortLinkUrl) {
        sessionStorage.setItem("shortLinkUrl", response.data.shortLinkUrl);
    }
    if (response.data.turnstileSiteKey) {
        sessionStorage.setItem("turnstileSiteKey", response.data.turnstileSiteKey);
    }
}