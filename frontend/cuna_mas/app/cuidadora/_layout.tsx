    import { Tabs } from 'expo-router';
    import { Home, Calculator } from 'lucide-react-native';

    export default function CuidadoraLayout() {
    return (
        <Tabs screenOptions={{ 
        headerShown: false, // Oculta la barra blanca nativa de arriba ya que tú tienes tu propio header de Cuna Más
        tabBarActiveTintColor: '#00AEEF', // Celeste Cuna Más cuando esté activo
        tabBarLabelStyle: { fontWeight: '700', fontSize: 12 },
        tabBarStyle: { height: 70, paddingBottom: 10 }
        }}>
        <Tabs.Screen 
            name="inicio" 
            options={{ 
            title: 'Inicio',
            tabBarIcon: ({ color }) => <Home color={color} size={24} />
            }} 
        />
        <Tabs.Screen 
            name="calculadora" // Recuerda crear luego el archivo app/(cuidadora)/calculadora.tsx si lo necesitas
            options={{ 
            title: 'Calculadora',
            tabBarIcon: ({ color }) => <Calculator color={color} size={24} />
            }} 
        />
        </Tabs>
    );
    }