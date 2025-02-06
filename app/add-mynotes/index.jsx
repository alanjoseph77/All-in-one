import { View, Text ,FlatList} from 'react-native'
import React from 'react'
import Note from '../../components/Note'

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
              <Note/>
            </View>
           }/>
  )
}