import { ref } from 'vue';

// Define the structure of the summary data
export interface SensorIssue {
    sensor_id: number;
    reason: string;
}

export interface StatsData {
    total_plants?: number;
    total_enabled_plants?: number;
    total_devices?: number;
    total_enabled_devices?: number;
    total_active_devices?: number;
    total_sensors?: number;
    total_enabled_sensors?: number;
    total_active_sensors?: number;
}

export interface SummaryData {
    sensor_issues: SensorIssue[] | null;
    active_sensors_not_attached_to_plant_count: number;
    stats: StatsData | null;
}

// State is defined outside the function to be a singleton (shared)
const loading = ref(false);
const error = ref<string | null>(null);
const summaryData = ref<SummaryData | null>(null);
let hasFetched = false;

// The composable function
export function useSummaryData() {
    const fetchData = async () => {
        // Only fetch if we haven't already or if a previous fetch failed
        if (hasFetched && summaryData.value) return;

        loading.value = true;
        hasFetched = true; // Mark that a fetch attempt has started
        error.value = null;

        try {
            const response = await fetch('/api/summary');
            if (!response.ok) {
                throw new Error(`Network response was not ok (${response.status})`);
            }
            const data: SummaryData = await response.json();

            if (data) {
                summaryData.value = data;
            } else {
                console.warn("Received null or undefined data from /api/summary");
                summaryData.value = null;
                error.value = "Received no data from summary endpoint.";
            }
        } catch (err: any) {
            console.error('Error fetching or processing summary:', err);
            error.value = `Failed to load summary data: ${err.message}`;
            summaryData.value = null;
            hasFetched = false; // Allow a refetch attempt if an error occurred
        } finally {
            loading.value = false;
        }
    };

    // If the data isn't present, fetch it.
    // This will be called by onMounted in the components.
    if (!hasFetched) {
        fetchData();
    }

    return {
        loading,
        error,
        summaryData,
        fetchData, // Expose a refetch function if needed
    };
}