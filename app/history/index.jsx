import { View, Text ,FlatList} from 'react-native'
import React from 'react'
import History from '../../components/History'
export default function index() {
  return (
        <FlatList
           data={[]}
           ListHeaderComponent={
            <View style={{
              
              padding: 25,
              backgroundColor: '#FFFFFF',
              height: '150%',
            }}>
              <History/>
            </View>
           }/>
  )
}