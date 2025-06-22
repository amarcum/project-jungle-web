import type {Plant, PlantDetails} from "@/types/ApiInterfaces";

export function getImageUrl(plant: Plant) {
    if (!plant.image_path || plant.image_path.length == 0) {
        return `/api/pic/plant/2/leaf.png`
    }
    return `/api/pic/plant/${plant.id}/${plant.image_path}`;
}

export function getMoisturePct(plant: PlantDetails): number {
    if (plant.last_moisture == null || plant.last_moisture.value == 0) {
        return 0;
    }
    return plant.last_moisture.value;
}