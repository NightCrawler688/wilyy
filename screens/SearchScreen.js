import React from 'react';
import {StyleSheet,Text,View,FlatList,TextInput,TouchableOpacity} from 'react-native';
import db from '../config';

export default class SearchScreen extends React.Component {
    constructor(props){
       super(props);
       this.state = {
           allTransactions:[],
           lastVisibleTransaction:null,
           search:null
       }
    }
    fetchMoreTransactions=async(text)=>{
        var enterText = text.split('');
      var text = text.toUpperCase();
      if(enterText[0].toUpperCase()==='B'){
          const transaction = await db.collection('transactions').where('bookId','==',text).startAfter(this.state.lastVisibleTransaction).limit(10).get();
          transaction.docs.map((doc)=>{
            this.setState({
            allTransactions:[...this.state.allTransactions,doc.data()],
            lastVisibleTransaction: doc
            })
          })
      }
      else if (enterText[0].toUpperCase()==='S') {
        const transaction = await db.collection('transactions').where('studentId','==',text).startAfter(this.state.lastVisibleTransaction).limit(10).get();
        transaction.docs.map((doc)=>{
          this.setState({
          allTransactions:[...this.state.allTransactions,doc.data()],
          lastVisibleTransaction: doc
          })
        })
      }
    }
    searchTransaction=async(text)=>{
      var enterText = text.split('');
      var text = text.toUpperCase();
      if(enterText[0].toUpperCase()==='B'){
          const transaction = await db.collection('transactions').where('bookId','==',text).get();
          transaction.docs.map((doc)=>{
            this.setState({
            allTransactions:[...this.state.allTransactions,doc.data()],
            lastVisibleTransaction: doc
            })
          })
      }
      else if (enterText[0].toUpperCase()==='S') {
        const transaction = await db.collection('transactions').where('studentId','==',text).get();
        transaction.docs.map((doc)=>{
          this.setState({
          allTransactions:[...this.state.allTransactions,doc.data()],
          lastVisibleTransaction: doc
          })
        })
      }
    }
    render() {
        return(
            <View style = {styles.container}>
                <View style = {styles.searchBar}>
                    <TextInput style = {styles.bar}
                    placeholder = 'Enter The Book Id Or The Student Id'
                    onChangeText = {(text)=>{
                        this.setState({
                            search:text
                        })
                    }}/>
                    <TouchableOpacity style = {styles.searchButton} onPress = {()=>{
                        this.searchTransaction(this.state.search);
                    }}>
                      <Text>
                          Search
                      </Text>
                    </TouchableOpacity>
                </View>
            <FlatList
            data = {this.state.allTransactions}
            renderItem = {({item})=>(
                <View style = {{borderBottomWidth:2}}>
                       <Text>
                           {'Student Id :' + item.studentId}
                       </Text>
                       <Text>
                           {'Book Id :' + item.bookId}
                       </Text>
                       <Text>
                           {'Transaction Type :' + item.transactionType}
                       </Text>
                   </View>
            )}
            keyExtractor = {(item,index)=>{
               index.toString();
            }}
            onEndReached = {()=>{
                this.fetchMoreTransactions(this.state.search)
            }}
            onEndReachedThreshold = {0.7}
           />
           </View>
        )
    }
}const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 20
      },
      searchBar:{
        flexDirection:'row',
        height:40,
        width:'auto',
        borderWidth:0.5,
        alignItems:'center',
        backgroundColor:'grey',
    
      },
      bar:{
        borderWidth:2,
        height:30,
        width:300,
        paddingLeft:10,
      },
      searchButton:{
        borderWidth:1,
        height:30,
        width:50,
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'green'
      }
})