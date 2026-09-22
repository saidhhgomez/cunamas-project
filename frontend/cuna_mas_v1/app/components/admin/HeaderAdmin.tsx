// components/AdminHeader.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AdminHeader({ user, titulo, modo = 'volver', onPress }) {
  const esLogout = modo === 'logout';

  return (
    <>
      <View style={styles.header}>
          <View style={styles.headerTop}>
          <View style={styles.adminInfo}>
            {user?.foto ? (
              <Image source={{ uri: user.foto }} style={styles.adminAvatar} />
            ) : (
              <View style={[styles.adminAvatar, styles.adminAvatarPlaceholder]}>
                <Text style={styles.adminAvatarInitial} allowFontScaling={false}>
                  {user?.nombre?.charAt(0)?.toUpperCase() ?? '?'}
                </Text>
              </View>
            )}
            <View style={styles.userTextContainer}>
              <Text style={styles.roleLabel} allowFontScaling={false}>Administrador</Text>
              <Text style={styles.adminWelcome} numberOfLines={2} allowFontScaling={false}>
                {user?.nombre || 'ADMINISTRADOR SISTEMA'}
              </Text>
            </View>
          </View>

            <TouchableOpacity style={styles.logoutButton} onPress={onPress} activeOpacity={0.8}>
              <Ionicons name={esLogout ? 'log-out-outline' : 'arrow-back'} size={23} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
    header: { backgroundColor: '#C5D800', paddingHorizontal: 20, paddingTop: 8 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  adminInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0 },
  userTextContainer: { flex: 1, minWidth: 0, paddingRight: 8 },
    adminAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#FFFFFF', marginRight: 10 },
  adminAvatarPlaceholder: { backgroundColor: '#006080', justifyContent: 'center', alignItems: 'center' },
  adminAvatarInitial: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  roleLabel: { fontSize: 10, color: '#006080', fontWeight: 'bold' },
  adminWelcome: { fontSize: 16, lineHeight: 20, color: '#006080', fontWeight: '900', flexShrink: 1 },
  logoutButton: {
    backgroundColor: '#FF007A',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  titleBar: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 25 },
  headerTitle: { fontSize: 26, color: '#006080', fontWeight: '900' },
});