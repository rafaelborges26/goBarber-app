import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import CreateAppointment from '../pages/CreateAppointment';
import AppointmentCreated from '../pages/AppointmentCreated';

const App = createStackNavigator(); // criar uma navegação (usuario autenticado)

const AuthRoutes: React.FC = () => (
  <App.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: '#312e38' },
    }}
  >
    <App.Screen name="Dashboard" component={Dashboard} />
    <App.Screen name="AppointmentCreated" component={AppointmentCreated} />
    <App.Screen name="CreateAppointment" component={CreateAppointment} />

    <App.Screen name="Profile" component={Profile} />
  </App.Navigator>
);

export default AuthRoutes;
