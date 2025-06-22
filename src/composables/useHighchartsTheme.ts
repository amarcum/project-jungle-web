// src/composables/useHighchartsTheme.ts
import { ref } from 'vue';
import Highcharts from 'highcharts';

// This uses Vite's special import.meta.glob to find all theme files.
const themeModules = import.meta.glob('/node_modules/highcharts/themes/*.js');

// This will preserve the functions inside the options object, which JSON.stringify was discarding.
function deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (obj instanceof Date) {
        return new Date(obj.getTime()) as any;
    }

    if (Array.isArray(obj)) {
        const arrCopy: any[] = [];
        for (let i = 0; i < obj.length; i++) {
            arrCopy[i] = deepClone(obj[i]);
        }
        return arrCopy as any;
    }

    const objCopy: { [key: string]: any } = {};
    for (const key in obj) {
        // Use Object.prototype.hasOwnProperty.call for safety
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            objCopy[key] = deepClone(obj[key]);
        }
    }

    return objCopy as T;
}

// Create a deep, clean copy of the original default options ONCE, using our new clone function.
const originalDefaultOptions = deepClone(Highcharts.getOptions());

const isThemeLoading = ref(false);
let loadedTheme: string | null = null;
// This ref will act as a "version" number to trigger reactivity.
const themeVersion = ref(0);

// This function will be the single point of control for loading themes.
export function useHighchartsTheme() {

    const setTheme = async (themeName: string | null) => {
        if (loadedTheme === themeName) {
            return; // Avoid reloading the same theme
        }

        isThemeLoading.value = true;

        // Always reset to our clean, original options before applying a new theme.
        Highcharts.setOptions(originalDefaultOptions);

        if (!themeName) {
            console.log("Using default Highcharts theme.");
            loadedTheme = null;
        } else {
            const path = `/node_modules/highcharts/themes/${themeName}.js`;
            const themeLoader = themeModules[path];

            if (themeLoader) {
                try {
                    console.log(`Loading theme: ${themeName}`);
                    const themeModule = await themeLoader();

                    // Get the factory function, whether it's the default export (ESM) or the module itself (CJS).
                    const themeFactory = (themeModule as any).default || themeModule;

                    if (typeof themeFactory === 'function') {
                        // Apply the theme by calling the factory with the Highcharts object.
                        themeFactory(Highcharts);
                        loadedTheme = themeName;
                        console.log(`Theme '${themeName}' applied successfully.`);
                    } else {
                        throw new Error("Loaded module is not a valid theme factory.");
                    }
                } catch (error) {
                    console.error(`Failed to load theme '${themeName}':`, error);
                    loadedTheme = null; // Reset on error
                }
            } else {
                console.warn(`Theme '${themeName}' not found.`);
            }
        }

        // Increment the version to trigger reactivity in any listening components.
        themeVersion.value++;
        isThemeLoading.value = false;
    };

    return {
        setTheme,
        isThemeLoading,
        themeVersion, // Expose for components to react to
    };
}