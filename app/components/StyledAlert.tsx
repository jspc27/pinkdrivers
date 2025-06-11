// components/StyledAlert.tsx
import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';

type StyledAlertProps = {
  visible: boolean;
  message: string;
  onClose: () => void;
};

const StyledAlert: React.FC<StyledAlertProps> = ({ visible, message, onClose }) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <View style={{
          backgroundColor: 'white',
          borderRadius: 20,
          padding: 25,
          width: '85%',
          alignItems: 'center'
        }}>
          <Text style={{
            fontSize: 16,
            color: '#FF69B4',
            marginBottom: 15,
            fontWeight: 'bold'
          }}>
            Atención
          </Text>
          <Text style={{ textAlign: 'center', color: '#444', marginBottom: 20 }}>
            {message}
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: '#FF69B4',
              paddingVertical: 10,
              paddingHorizontal: 25,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Aceptar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default StyledAlert;
