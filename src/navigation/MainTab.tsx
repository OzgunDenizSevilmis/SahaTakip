import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import RequestsScreen from '../screens/RequestsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CreateRequestScreen from '../screens/CreateRequestScreen';
import type {MainTabParamList} from '../types/Navigation';
import{Ionicons} from '@expo/vector-icons';


const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTab() {
    return (
        <Tab.Navigator>
           <Tab.Screen
  name="Home"
  component={HomeScreen}
  options={{
    title: 'Ana Sayfa',
    headerShown: false,
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="home-outline" size={size} color={color} />
    ),
  }}
/>

<Tab.Screen
  name="Requests"
  component={RequestsScreen}
  options={{
    title: 'Talepler',
    headerShown: false,
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="list-outline" size={size} color={color} />
    ),
  }}
/>

<Tab.Screen
  name="CreateRequest"
  component={CreateRequestScreen}
  options={{
    title: 'Talep Oluştur',
    headerShown: false,
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="add-circle-outline" size={size} color={color} />
    ),
  }}
/>

<Tab.Screen
  name="Profile"
  component={ProfileScreen}
  options={{
    title: 'Profil',
    headerShown: false,
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="person-outline" size={size} color={color} />
    ),
  }}
/>
        </Tab.Navigator>
    );
}
