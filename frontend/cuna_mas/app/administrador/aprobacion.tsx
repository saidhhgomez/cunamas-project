import React, { useState, useEffect } from 'react'; 
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  StatusBar,
  ActivityIndicator,
  Alert,
  useWindowDimensions
} from 'react-native'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, usePathname } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import { usuarioService } from '../../service/adminService'; 

interface UsuarioPendiente {
  idPersona: number;
  nombres: string;
  apPaterno: string;
  apMaterno: string;
  numeroDocumento: string;
  correoElectronico: string;
  tipoDocumento: string;
}

export default function ActivarCuentaMartina() {
  const { width } = useWindowDimensions();
  const esPantallaGrande = width > 600;
  const router = useRouter();
  const insets = useSafeAreaInsets(); 
  const pathname = usePathname(); // 👈 para resaltar el tab activo en el nav

  const { idPersona } = useLocalSearchParams();

  const [usuario, setUsuario] = useState<UsuarioPendiente | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // 🗂️ Modificado: Ahora solo almacena el ID del único rol seleccionado
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

  useEffect(() => {
    const cargarDetalleUsuario = async () => {
      if (!idPersona) {
        Alert.alert("Error", "No se encontró el identificador del usuario.");
        router.back();
        return;
      }

      try {
        setLoading(true);
        const data = await usuarioService.obtenerPendientePorId(Number(idPersona));
        setUsuario(data);
      } catch (error) {
        Alert.alert("Error", "No se pudo recuperar la información detallada del usuario.");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    cargarDetalleUsuario();
  }, [idPersona]);

  // 🔄 Modificado: Alterna el rol único. Si hace clic en el mismo, se desmarca.
  const handleSelectRole = (roleId: number) => {
    setSelectedRoleId(prevId => prevId === roleId ? null : roleId);
  };

  const handleActivarCuenta = async () => {
    // Verificación si no ha seleccionado ningún rol
    if (selectedRoleId === null) {
      Alert.alert("Atención", "Por favor, selecciona un rol para el usuario.");
      return;
    }

    try {
      setIsSubmitting(true); // Esto activará el bloqueo de pantalla total
      
      // Enviamos el idPersona y el array conteniendo el único rol seleccionado
      await usuarioService.aprobarUsuario(Number(idPersona), [selectedRoleId]); 
      
      Alert.alert("Éxito", "Usuario aprobado y cuenta activada correctamente.", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert("Error", "Ocurrió un problema al intentar activar la cuenta.");
    } finally {
      setIsSubmitting(false); // Libera la pantalla pase lo que pase
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#006080" />
        <Text style={styles.loadingText}>Obteniendo datos desde Cuna Más...</Text>
      </View>
    );
  }

  const nombreCompleto = usuario 
    ? `${usuario.apPaterno} ${usuario.apMaterno} ${usuario.nombres}`
    : '';

  return ( 
    <View style={[styles.container, { paddingTop: insets.top }]}> 
      <StatusBar barStyle="light-content" backgroundColor="#C5D800" /> 

      {/* Header curvo (mismo estilo que UsuariosPendientes) */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.adminInfo}>
            <TouchableOpacity onPress={() => router.back()} disabled={isSubmitting} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#006080" />
            </TouchableOpacity>
          </View>

        </View>
      </View>

      {/* Barra de título blanca (igual que UsuariosPendientes) */}
      <View style={styles.titleBar}>
        <Text style={styles.headerTitle}>Activar Cuenta</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, esPantallaGrande && styles.scrollContentGrande]} showsVerticalScrollIndicator={false}> 
        
        {/* Ficha del Usuario Dinámica */} 
        <View style={styles.card}> 
          <View style={styles.cardHeader}> 
            <View style={styles.badge}> 
              <Text style={styles.badgeText}>PENDIENTE</Text> 
            </View> 
            <Text style={styles.idText}>ID: {usuario?.idPersona}</Text> 
          </View> 
          
          <Text style={styles.fieldLabel}>NOMBRE COMPLETO</Text> 
          <Text style={styles.userName}>{nombreCompleto}</Text> 

          <View style={styles.infoField}> 
            <View style={styles.iconContainer}> 
              <MaterialCommunityIcons name="card-account-details-outline" size={24} color="#006080" /> 
            </View> 
            <View> 
              <Text style={styles.infoLabel}>{usuario?.tipoDocumento || 'Documento'}</Text> 
              <Text style={styles.infoValue}>{usuario?.numeroDocumento}</Text> 
            </View> 
          </View> 

          <View style={styles.infoField}> 
            <View style={styles.iconContainer}> 
              <Ionicons name="mail-outline" size={24} color="#006080" /> 
            </View> 
            <View> 
              <Text style={styles.infoLabel}>Correo Electrónico</Text> 
              <Text style={styles.infoValue}>{usuario?.correoElectronico}</Text> 
            </View> 
          </View> 
        </View> 

        <Text style={styles.sectionTitle}>Asignar Rol (Selecciona uno)</Text> 

        {/* Listado de Selección de Roles Únicos */} 
        <View style={styles.rolesList}> 
          <RoleItem label="Asistente Técnico (AT)" icon="shield-check-outline" isSelected={selectedRoleId === 1} onPress={() => handleSelectRole(1)} disabled={isSubmitting} /> 
          <RoleItem label="Socia de Cocina Tipo 1" icon="silverware-fork-knife" isSelected={selectedRoleId === 2} onPress={() => handleSelectRole(2)} disabled={isSubmitting} /> 
          <RoleItem label="Socia de Cocina Tipo 2" icon="silverware-fork-knife" isSelected={selectedRoleId === 3} onPress={() => handleSelectRole(3)} disabled={isSubmitting} /> 
          <RoleItem label="Experta en Nutrición" icon="calculator" isSelected={selectedRoleId === 4} onPress={() => handleSelectRole(4)} disabled={isSubmitting} /> 
          <RoleItem label="Madre Cuidadora" icon="hand-heart-outline" isSelected={selectedRoleId === 5} onPress={() => handleSelectRole(5)} disabled={isSubmitting} /> 
          <RoleItem label="Madre Guía" icon="account-group" isSelected={selectedRoleId === 6} onPress={() => handleSelectRole(6)} disabled={isSubmitting} /> 
        </View> 

        {/* Botón Activar Cuenta */} 
        <TouchableOpacity 
          style={[styles.mainButton, selectedRoleId === null && { backgroundColor: '#B0BEC5' }]} 
          activeOpacity={0.8}
          onPress={handleActivarCuenta}
          disabled={isSubmitting || selectedRoleId === null}
        > 
          <Ionicons name="person-add-outline" size={22} color="#FFF" style={{marginRight: 10}} /> 
          <Text style={styles.mainButtonText}>ACTIVAR CUENTA</Text> 
        </TouchableOpacity> 
      </ScrollView> 



      {/* 🔒 CAPA DE BLOQUEO ABSOLUTO DE PANTALLA */}
      {isSubmitting && (
        <View style={styles.blockingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#03A9F4" />
            <Text style={styles.blockingText}>Procesando activación...</Text>
            <Text style={styles.blockingSubtext}>Por favor, no cierre la aplicación</Text>
          </View>
        </View>
      )}
    </View> 
  ); 
}

const RoleItem = ({ label, icon, isSelected, onPress, disabled }) => ( 
  <TouchableOpacity 
    style={[styles.roleRow, isSelected && styles.roleRowActive]} 
    onPress={onPress} 
    activeOpacity={0.7} 
    disabled={disabled}
  > 
    <View style={styles.roleIconBg}> 
      <MaterialCommunityIcons name={icon as any} size={24} color="#006080" /> 
    </View> 
    <Text style={styles.roleLabel}>{label}</Text> 
    {/* Estructura circular simulando un Radio Button */}
    <View style={[styles.radioButton, isSelected && styles.radioButtonActive]}> 
      {isSelected && <View style={styles.radioButtonInner} />} 
    </View> 
  </TouchableOpacity> 
); 

const styles = StyleSheet.create({ 
  container: { flex: 1, backgroundColor: '#F9F9F9' }, 
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9F9F9' },
  loadingText: { marginTop: 12, color: '#006080', fontWeight: '600', fontSize: 16 },

  // Header (mismo estilo que UsuariosPendientes)
  header: { 
    backgroundColor: '#C5D800', 
    paddingHorizontal: 20, 
  }, 
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }, 
  adminInfo: { flexDirection: 'row', alignItems: 'center' }, 
  backButton: { marginRight: 12 },
  adminAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#FFFFFF', marginRight: 10 }, 
  logoutButton: { backgroundColor: '#FF0080', width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', elevation: 2 }, 
  titleBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 25,
  },
  headerTitle: { 
    fontSize: 26, 
    color: '#006080', 
    fontWeight: '900' 
  }, 

  scrollContent: { padding: 20, paddingBottom: 100 }, 
  scrollContentGrande: { maxWidth: 600, width: '100%', alignSelf: 'center' },
  card: { backgroundColor: '#FFF', borderRadius: 30, padding: 20, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, marginBottom: 25 }, 
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }, 
  badge: { backgroundColor: '#FF3B30', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 }, 
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' }, 
  idText: { color: '#666', fontWeight: 'bold' }, 
  fieldLabel: { fontSize: 10, color: '#888', fontWeight: 'bold', letterSpacing: 0.5, marginBottom: 4 }, 
  userName: { fontSize: 20, fontWeight: '900', color: '#333', marginBottom: 20 }, 
  infoField: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F4F4', padding: 12, borderRadius: 15, marginBottom: 12 }, 
  iconContainer: { marginRight: 15 }, 
  infoLabel: { fontSize: 10, color: '#777', fontWeight: 'bold' }, 
  infoValue: { fontSize: 15, color: '#333', fontWeight: '600' }, 
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#333', marginBottom: 15 }, 
  rolesList: { marginBottom: 30 }, 
  roleRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEEEEE', padding: 15, borderRadius: 20, marginBottom: 12, borderWidth: 2, borderColor: 'transparent' }, 
  roleRowActive: { backgroundColor: '#E3F2FD', borderColor: '#03A9F4' }, 
  roleIconBg: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginRight: 15 }, 
  roleLabel: { flex: 1, fontSize: 16, fontWeight: '600', color: '#333' }, 
  
  // Estilos de Radio Button (Selección Única)
  radioButton: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#CCC', backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' }, 
  radioButtonActive: { borderColor: '#006080' }, 
  radioButtonInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#006080' }, 

  mainButton: { backgroundColor: '#03A9F4', flexDirection: 'row', height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: '#03A9F4', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 6 }, 
  mainButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }, 

  // Nav inferior (mismo estilo que UsuariosPendientes, 3 botones)
  bottomNav: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E0E0E0', position: 'absolute', bottom: 0, width: '100%' }, 
  navItem: { flex: 1, justifyContent: 'center', alignItems: 'center' }, 
  navLabel: { fontSize: 11, marginTop: 4, color: '#757575' },

  // Estilos de la Capa de Bloqueo Total
  blockingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingBox: {
    backgroundColor: '#FFFFFF',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    width: '80%',
    maxWidth: 320,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  blockingText: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  blockingSubtext: {
    marginTop: 5,
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
  }
});