import { createRouter, createWebHistory } from 'vue-router';
import ChartsView from '@/views/ChartsView.vue';
import DeviceList from '@/views/DeviceListView.vue';
import PlantView from "@/views/PlantView.vue";
import PlantList from '@/views/PlantListView.vue';
import SensorView from '@/views/SensorView.vue';
import SensorListView from '@/views/SensorListView.vue';
import Settings from '@/views/SettingsView.vue';
import DeviceView from '@/views/DeviceView.vue';

const router = createRouter({
    // history: createWebHistory(import.meta.env.BASE_URL),
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: PlantList
        },
        {
            path: '/charts',
            name: 'charts',
            component: ChartsView
        },
        {
            path: '/plant/:id',
            name: 'plant',
            component: PlantView,
            props: (route) => ({ id: String(route.params.id) })
        },
        {
            path: "/plant/:id/edit",
            name: "PlantEdit",
            component: PlantView,
            props: (route) => ({ id: String(route.params.id) })
        },
        {
            path: '/plants',
            name: 'plantList',
            component: PlantList
        },
        {
            path: '/devices',
            name: 'deviceList',
            component: DeviceList
        },
        {
            path: '/device/:id',
            name: 'device',
            component: DeviceView,
            props:  (device) => ({ id: String(device.params.id) })
        },
        {
            path: '/deviceHardware/:hardwareId',
            name: 'deviceHardware',
            component: DeviceView,
            props: (route) => ({ id: String(route.params.id) })
        },
        {
            path: '/sensor/:id',
            name: 'sensor',
            component: SensorView,
            props: (route) => ({ id: String(route.params.id) })
        },
        {
            path: '/sensors',
            name: 'sensorList',
            component: SensorListView
        },
        {
            path: '/settings',
            component: Settings,
        },
    ]
});

export default router;