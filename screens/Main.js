import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableNativeFeedback,
  ImageBackground,
  TouchableWithoutFeedback,
  Dimensions,
  TextInput,
} from "react-native";
import { serverStore } from "../models/Server";
import { observer } from "mobx-react";
import Loader from "../components/Loader";
import moment from "moment";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const backgroundImage = require("../assets/img/background.png");

const Main = () => {
  const [isLoaderVisible, setIsLoaderVisible] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedServer, setSelectedServer] = useState({});
  const [serverState, setServerState] = useState({});
  const [serverList, setServerList] = useState([]);
  const [sliderProgressStep, setSliderProgressStep] = useState(0);
  const [sliderProgress, setSliderProgress] = useState(0);
  const [sliderProgressText, setSliderProgressText] = useState("");

  const flatListOptimizationProps = {
    initialNumToRender: 10,
    maxToRenderPerBatch: 10,
    removeClippedSubviews: true,
    keyExtractor: useCallback((s) => String(s.id), []),
  };

  const testIp = async (serverId) => {
    setIsLoaderVisible(true);
    // console.log('test ip: ' + serverId)
    const selectedServerUser = serverStore.list.filter(
      (item) => item.id === serverId
    )[0];
    setSelectedServer(selectedServerUser);

    const serverCall = await serverStore.callServer(serverId);

    setServerState(serverCall);
    setModalVisible(!modalVisible);
    setIsLoaderVisible(false);
  };

  const findServer = (findQuery) => {
    // console.log(findQuery)
    let filteredList = [];
    if (findQuery) {
      filteredList = serverStore.list.filter(
        (item) =>
          item.name.toLowerCase().includes(findQuery.toLowerCase()) ||
          item.responsable?.toLowerCase().includes(findQuery.toLowerCase())
      );
      setServerList(filteredList);
    } else {
      setServerList(serverStore.list);
    }
  };

  const syncServers = () => {
    setSliderProgress(0);
    setSliderProgressStep(0);
    setSliderProgressText("Last check: " + moment().format("LLLL"));
    serverStore.list.map((item) => {
      syncServersRemote(item.id);
    });
  };

  const syncServersRemote = async (serverId) => {
    const serverCall = await serverStore.callServer(serverId);
    setServerState(serverCall);
    //console.log(serverCall)
    serverStore.updateServerState(serverId, serverCall.status, serverCall);
    setSliderProgressStep((sliderProgressInner) => sliderProgressInner + 1);
  };

  useEffect(() => {
    serverStore.list.length > 0
      ? setIsLoaderVisible(false)
      : setIsLoaderVisible(true);
  }, [serverStore.list]);

  useEffect(() => {
    // console.log('real progress ' + sliderProgressStep)
    setSliderProgress(
      ((sliderProgressStep * 100) / serverStore.list.length).toFixed(0)
    );
  }, [sliderProgressStep]);

  const renderList = (itemData) => {
    //console.log(itemData.item);
    return (
      <View style={styles.listItem} key={itemData.item.id}>
        <TouchableNativeFeedback onPress={testIp.bind(this, itemData.item.id)}>
          <View style={styles.listItemInner}>
            <View style={{ flex: 9 }}>
              <View>
                <Text style={styles.itemTitle}>{itemData.item.name}</Text>
                <Text numberOfLines={1} style={styles.itemIp}>
                  {itemData.item.responsable}
                </Text>
                <Text style={styles.itemIp}>{itemData.item.ip}</Text>
                {itemData.item.version && (
                  <Text style={styles.itemIp}>
                    Version: {itemData.item.version}
                  </Text>
                )}
                {itemData.item.error && (
                  <Text style={styles.itemErrorText}>
                    Error: {itemData.item.error}
                  </Text>
                )}
              </View>
            </View>
            <View style={{ flex: 1 }}>
              {sliderProgressText ? (
                <View>
                  {itemData.item.status ? (
                    <MaterialIcons
                      name="check-circle-outline"
                      color={"green"}
                      size={32}
                    />
                  ) : (
                    <MaterialIcons
                      name="error-outline"
                      color={"red"}
                      size={32}
                    />
                  )}
                </View>
              ) : null}
            </View>
          </View>
        </TouchableNativeFeedback>
      </View>
    );
  };

  return (
    <View style={styles.centeredView}>
      <Loader isVisible={isLoaderVisible} />
      <ImageBackground style={styles.image} source={backgroundImage}>
        <Text style={styles.title}>Lista Servidores AF + SS</Text>
        <View style={styles.searchContainer}>
          <TextInput onChangeText={findServer} placeholder={"Buscar..."} />
        </View>
        {sliderProgressText ? (
          <View style={styles.sliderContainer}>
            <View style={styles.progressContainer}>
              <View
                style={[
                  { width: sliderProgress + " %" },
                  styles.progressContainerInner,
                ]}
              >
                {sliderProgress >= 10 ? (
                  <Text style={styles.progressText}>{sliderProgress} %</Text>
                ) : null}
              </View>
            </View>
            <View>
              <Text style={{ fontSize: 10 }}>{sliderProgressText}</Text>
            </View>
          </View>
        ) : null}
        <FlatList
          style={{ flex: 1 }}
          data={serverList.length > 0 ? serverList : serverStore.list}
          renderItem={renderList}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          {...flatListOptimizationProps}
        />
      </ImageBackground>
      <Modal transparent={true} visible={modalVisible}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View>
                {serverState.status === true ? (
                  <Text
                    style={{ ...styles.modalStatus, ...styles.modalOnline }}
                  >
                    ONLINE
                  </Text>
                ) : (
                  <Text
                    style={{ ...styles.modalStatus, ...styles.modalOffline }}
                  >
                    OFFLINE
                  </Text>
                )}
              </View>
              <Text style={styles.modalTitle}>
                {selectedServer.name}
                <Text style={styles.modalResponsable}>
                  {" "}
                  ({selectedServer.responsable})
                </Text>
              </Text>
              <View style={styles.modalResult}>
                <Text style={styles.modalResultText}>
                  Response from server:
                </Text>
                <Text style={styles.modalResultText}>
                  {serverState?.response?.text}
                </Text>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <View style={styles.fab}>
        <TouchableNativeFeedback onPress={syncServers}>
          <MaterialIcons name="sync" size={30} color="white" />
        </TouchableNativeFeedback>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    width: Dimensions.get("screen").width - 30,
    borderBottomColor: "grey",
    borderBottomWidth: 0.5,
    marginVertical: 20,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalStatus: {
    fontWeight: "bold",
    fontSize: 20,
  },
  modalOnline: {
    color: "green",
  },
  modalTitle: {
    marginVertical: 10,
  },
  modalOffline: {
    color: "red",
  },
  modalResult: {
    borderWidth: 0.5,
    borderColor: "grey",
    width: "100%",
    backgroundColor: "lightgrey",
    padding: 10,
  },
  modalResultText: {
    fontSize: 10,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    elevation: 5,
    borderBottomWidth: 0.2,
    width: Dimensions.get("screen").width - 30,
  },

  image: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },
  listItem: {
    elevation: 5,
    backgroundColor: "#050A30",
    flex: 1,
    padding: 15,
    marginVertical: 5,
    borderRadius: 5,
    //overflow: 'hidden',
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  itemTitle: {
    fontWeight: "bold",
    color: "white",
  },
  itemIp: {
    fontSize: 11,
    color: "white",
  },
  itemErrorText: {
    fontSize: 11,
    color: "red",
  },
  listContainer: {
    width: Dimensions.get("screen").width - 30,
    marginTop: 10,
    paddingBottom: 80,
  },
  listItemInner: {
    flex: 1,
    flexDirection: "row",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    justifyContent: "space-between",
    alignItems: "center",
  },
  fab: {
    borderWidth: 1,
    borderColor: "green",
    alignItems: "center",
    justifyContent: "center",
    width: 70,
    position: "absolute",
    bottom: 10,
    right: 10,
    height: 70,
    backgroundColor: "green",
    borderRadius: 50,
    elevation: 5,
  },
  progressContainer: {
    width: Dimensions.get("screen").width - 30,
    backgroundColor: "lightgrey",
  },
  progressText: {
    color: "white",
    fontSize: 12,
    width: "100%",
    textAlign: "center",
  },
  progressContainerInner: {
    padding: 3,
    backgroundColor: "green",
    flexDirection: "row",
    height: 25,
  },
  sliderContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 50,
  },
});

export default observer(Main);
