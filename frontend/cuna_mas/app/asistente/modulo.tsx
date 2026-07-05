import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  FlatList,
  useWindowDimensions,
  ActivityIndicator
} from 'react-native';
import { User, LogOut, UserRound } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext'; 
import { ModuloService } from '../../service/moduloService';

export default function ModulosListScreen() {
  const { user, logout } = useAuth(); 
  const { width } = useWindowDimensions();
  const esPantallaGrande = width > 600;

  // Estados del Scroll Infinito
  const [modulos, setModulos] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  // ID de local fijo de ejemplo (conforme a tu Postman)
  const [idLocalSeleccionado] = useState(5); 

  const cargarModulos = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const resultado = await ModuloService.getModulosPorLocal(idLocalSeleccionado, page);

      if (resultado.modulos.length === 0) {
        setHasMore(false);
      } else {
        // Concatenamos los módulos nuevos con los anteriores
        setModulos(prevModulos => [...prevModulos, ...resultado.modulos]);
        
        if (resultado.isLast) {
          setHasMore(false);
        } else {
          setPage(prevPage => prevPage + 1); 
        }
      }
    } catch (error) {
      console.error("Error cargando módulos en la vista:", error);
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial al montar o cambiar de local
  useEffect(() => {
    cargarModulos();
  }, [idLocalSeleccionado]);

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Header Corporativo Responsivo */}
      <View style={[styles.header, { height: esPantallaGrande ? 160 : 130 }]}>
        <View style={styles.userInfo}>
          <View style={styles.avatarCircle}>
            <User color="#000" size={esPantallaGrande ? 32 : 26} />
          </View>
          <View style={styles.welcomeContainer}>
            <Text style={[styles.welcomeTitle, { fontSize: esPantallaGrande ? 24 : 20 }]}>
              Bienvenid@
            </Text>
            <Text 
              style={[styles.userName, { fontSize: esPantallaGrande ? 18 : 15 }]}
              numberOfLines={1}
            >
              {user?.nombre || "Cuidadora"}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={logout}
          activeOpacity={0.8}
        >
          <LogOut color="#FFF" size={esPantallaGrande ? 26 : 22} />
        </TouchableOpacity>
      </View>

      {/* FlatList con Scroll Infinito */}
      <FlatList
        data={modulos}
        keyExtractor={(item) => item.idModulo.toString()} 
        contentContainerStyle={[
          styles.scrollContent, 
          esPantallaGrande && styles.tabletContent
        ]}
        showsVerticalScrollIndicator={false}
        
        ListHeaderComponent={
          <Text style={[styles.title, { fontSize: esPantallaGrande ? 38 : 32 }]}>
            Módulos
          </Text>
        }
        
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.moduloItem}
            activeOpacity={0.7}
          >
            <View style={styles.iconWrapper}>
              <UserRound color="#8A2BE2" size={esPantallaGrande ? 34 : 28} strokeWidth={2.5} />
            </View>
            <Text 
              style={[styles.moduloName, { fontSize: esPantallaGrande ? 20 : 16 }]}
              numberOfLines={1}
            >
              {item.nombreModulo} 
            </Text>
          </TouchableOpacity>
        )}

        // Disparadores del Scroll
        onEndReached={cargarModulos}
        onEndReachedThreshold={0.4}

        // Loader de la parte inferior
        ListFooterComponent={() => (
          loading && hasMore ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator size="small" color="#00AEEF" />
            </View>
          ) : null
        )}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    backgroundColor: '#C5D800',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '6%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 15,
  },
  avatarCircle: {
    backgroundColor: '#FFF',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeContainer: {
    marginLeft: 12,
    flex: 1,
  },
  welcomeTitle: {
    color: '#00AEEF',
    fontWeight: 'bold',
  },
  userName: {
    color: '#FFF',
    fontWeight: '600',
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: '#FF007A',
    padding: 12,
    borderRadius: 25,
  },
  scrollContent: {
    paddingHorizontal: '6%',
    paddingBottom: 30,
    width: '100%',
  },
  tabletContent: {
    maxWidth: 550,
    alignSelf: 'center',
  },
  title: {
    fontWeight: '900',
    color: '#00AEEF',
    marginBottom: 20,
    marginTop: 25,
  },
  moduloItem: {
    width: '100%',
    height: 72,
    borderWidth: 2,
    borderColor: '#8A2BE2',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 14,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduloName: {
    fontWeight: '800',
    color: '#1E293B',
    marginLeft: 14,
    textTransform: 'uppercase',
    flex: 1,
  },
  footerLoading: {
    paddingVertical: 16,
    alignItems: 'center',
  }
});