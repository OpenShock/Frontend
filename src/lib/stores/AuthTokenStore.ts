import type { AuthToken } from "$lib/types/AuthToken";
import { writable, type Writable } from "svelte/store";

const LOCALSTORAGE_KEY = "authToken";

const { subscribe, set, update } = writable<AuthToken | null>(null);

function setAll(authToken: AuthToken | null) {
    if (!authToken) {
        localStorage.removeItem("authToken");
        set(null);
        return;
    }

    localStorage.setItem("authToken", JSON.stringify(authToken));
    set(authToken);
}

function isAuthToken(value: unknown): value is AuthToken {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const authToken = value as AuthToken;
    return typeof authToken.token === "string" && typeof authToken.expires === "number";
}

function updateFromJson(json: string | null) {
    if (!json) {
        setAll(null);
        return;
    }

    const authToken = JSON.parse(json);
    if (!isAuthToken(authToken)) {
        console.error("Invalid auth token, clearing localStorage");
        setAll(null);
        return;
    }

    setAll(authToken);
}

window.addEventListener("storage", (event) => {
    if (event.storageArea === localStorage && event.key === LOCALSTORAGE_KEY) {
        updateFromJson(event.newValue);
    }
});

export const authTokenStore: Writable<AuthToken | null> = {
    subscribe,
    set: setAll,
    update,
};