import AsyncStorage from '@react-native-async-storage/async-storage';
import {createDeviceQuota} from './device-quota.cjs';
export const deviceQuota=createDeviceQuota(AsyncStorage);
