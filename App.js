import React, { useEffect } from 'react';
import Main from './screens/Main'
import { serverStore } from './models/Server'
const App = () => {

  const initServers = async () => {
    await serverStore.getServers()
  }

  useEffect(() => {
    initServers()
  })

  return <Main />
}


export default App