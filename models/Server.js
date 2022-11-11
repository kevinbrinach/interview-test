import { observable, action, makeObservable } from "mobx";
import APIKit from "../services/ApiService";

class Server {
  list = [];
  addList = (value) => {
    this.list = [...value];
  };
  getServers = async () => {
    let res = null;
    try {
      res = await APIKit.get("");
      if (res.status) {
        //console.log(res.data);
        let dataFiltered = res.data
          .sort((a, b) => (a.name > b.name ? 1 : -1))
          .filter((item) => (item.ip ? true : false));
        this.addList(dataFiltered);
      } else {
        // console.log(res)
      }
    } catch (error) {
      console.log(error);
    }
  };
  callServer = async (serverId) => {
    let res = null;
    try {
      res = await APIKit.get("?id=" + serverId);
      //console.log(res.response.text);
      return res;
    } catch (error) {
      // console.log(error)
      return null;
    }
  };
  updateServerState = (id, status, resObject) => {
    let itemFound = this.list.find((item) => item.id == id);
    itemFound.status = status;
    if (status) {
      itemFound.version = JSON.parse(resObject.response.text).Version;
    } else {
      itemFound.error = resObject.response.text;
    }
    //console.log(itemFound)
  };
  constructor() {
    makeObservable(this, {
      list: observable,
      addList: action,
      updateServerState: action,
    });
  }
}

export const serverStore = new Server();
