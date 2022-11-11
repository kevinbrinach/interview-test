import React from 'react'
import { View, Modal, Text, StyleSheet, ImageBackground, ActivityIndicator } from 'react-native'
const backgroundImage = require('../assets/img/background.png')

const Loader = ({ isVisible }) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isVisible}
            onRequestClose={() => console.log('im a loader')}>
            <View style={styles.modalContainer}>
                <ImageBackground source={backgroundImage} style={styles.image}>
                    <View style={styles.modalView}>
                        <Text style={styles.textIndicator}>Connecting to server...</Text>
                        <ActivityIndicator size="large" color="red" />
                    </View>
                </ImageBackground>
            </View>
        </Modal>
    )
}
const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        backgroundColor: 'transparent',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        width: '90%',
    },
    image: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        opacity: 0.95
    },
    textIndicator: {
        fontSize: 16,
        color: 'black',
        marginVertical: 20
    }
})
export default Loader
