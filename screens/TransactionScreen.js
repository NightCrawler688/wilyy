import React from 'react';
import {StyleSheet,Text,View,TouchableOpacity,TextInput,Image,KeyboardAvoidingView,Alert,ToastAndroid} from 'react-native';
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner';
import db from '../config';
import firebase from 'firebase';

export default class TransactionScreen extends React.Component {
    constructor() {
        super();
        this.state = {
            hasCameraPermissions:null,
            scanned:false,
            scannedData:" ",
            buttonState:'normal',
            scannedBookId:'',
            scannedStudentId:''
        }
    }
    getCameraPermission=async(id)=>{
        const {status} = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({
            hasCameraPermissions:status==='granted',
            buttonState:id,
            scanned:false
        })
    }
    handleBarCodeScanned=async({type,data})=>{
        if(this.state.buttonState=== 'bookId') {
            this.setState({
                scanned:true,
                scannedBookId:data,
                buttonState:'normal'
            })
        }
        else if(this.setState.buttonState === 'studentId') {
            this.setState({
                scanned:true,
                scannedStudentId:data,
                buttonState:'normal'
            })
        }
      
    }
    initiateBookIssue=async()=>{
        db.collection('transactions').add({
            'studentId':this.state.scannedStudentId,
            'bookId': this.state.scannedBookId,
            'transactionType':'Issue'
        })
        db.collection('books').doc(this.state.scannedBookId).update({
            bookAvailability:false
        })
        db.collection('students').doc(this.state.scannedStudentId).update({
            'numberOfBooksIssued':firebase.firestore.FieldValue.increment(1)
        })
        //Alert.alert('Book Issued');
        this.setState({
            scannedStudentId:'',
            scannedBookId:''
        }) 
    }
    initiateBookReturn=async()=>{
        db.collection('transactions').add({
            'studentId':this.state.scannedStudentId,
            'bookId': this.state.scannedBookId,
            'transactionType':'Returned'
        })
        db.collection('books').doc(this.state.scannedBookId).update({
            bookAvailability:true
        })
        db.collection('students').doc(this.state.scannedStudentId).update({
            'numberOfBooksIssued':firebase.firestore.FieldValue.increment(-1)
        })
       // Alert.alert('Book Returned');
        this.setState({
            scannedStudentId:'',
            scannedBookId:''
        }) 
    }
    checkStudentEligibilityForBookIssue=async()=>{
        const studentRef =  await db.collection('students').where('studentId','==',this.state.scannedStudentId).get()
        var isStudentEligible = ''
        if(studentRef.docs.length==0){
            this.setState({
                scannedStudentId:'',
                scannedBookId:''
            })
              isStudentEligible = false
              Alert.alert('StudentID does not exist in the database')
        }
        else{
            studentRef.docs.map((doc)=>{
                var student = doc.data();
                if(student.numberOfBooksIssued < 2) {
                    isStudentEligible = true;
                } 
                else{
                    isStudentEligible = false
                    Alert.alert('Student already has issued two books')
                    this.setState({
                        scannedBookId:'',
                        scannedStudentId:''
                    })
                }
            })
        }
        return isStudentEligible 
    }
    checkStudentEligibilityForBookReturned=async()=>{
       const transactionsRef = await db.collection('transactions').where('bookId','==',this.state.scannedBookId).limit(1).get()
       var isStudentEligible = ''
       transactionsRef.docs.map((doc)=>{
            var lastBookTransaction = doc.data();
            if(this.state.scannedStudentId === lastBookTransaction.studentId){
                isStudentEligible = true
            }
            else{
                isStudentEligible= false
                Alert.alert('The book wasnt issued by the student');
                this.setState({
                    scannedBookId:'',
                    scannedStudentId:''
                })
            }
       })
       return isStudentEligible
    }
    checkBookEligibility=async()=>{
        const bookRef = await db.collection('books').where('bookId','==',this.state.scannedBookId).get()
        var transactionType = ''
        if(bookRef.docs.length==0) {
            transactionType = false
        }
        else{
           bookRef.docs.map((doc)=>{
              var book = doc.data();
              if(book.bookAvailability===true){
                  transactionType = 'issue'
              }
              else{
                  transactionType = 'return'
              }
           })
        }
        return transactionType
    }
   handleTransaction=async()=>{
       /*db.collection('books').doc(this.state.scannedBookId).get()
       .then((doc)=>{
          console.log(doc.data());
          var book = doc.data();
          if(book.bookAvailability=== true) {
              this.initiateBookIssue();
              //ToastAndroid.show('Book Issued',ToastAndroid.SHORT);
          }
          else {
              this.initiateBookReturn();
              //ToastAndroid.show('Book Returned',ToastAndroid.SHORT);
          }
       })*/
       var transactionType = await this.checkBookEligibility();
       if(!transactionType) {
           Alert.alert('The book doesnt exist in the library database')
           this.setState({
            scannedBookId:'',
            scannedStudentId:''
           }) 
       }
       else if(transactionType==='issue'){
           var isStudentEligible = await this.checkStudentEligibilityForBookIssue();
           if(isStudentEligible===true){
               this.initiateBookIssue();
               Alert.alert('Book issued to the student');
           }
       }
       else{
           var isStudentEligible = await this.checkStudentEligibilityForBookReturned();
           if(isStudentEligible===true){
               this.initiateBookReturn();
               Alert.alert('Book returned by the student');
           }
       }
    }
    render() {
        const hasCameraPermissions = this.state.hasCameraPermissions;
        const scanned = this.state.scanned;
        const buttonState =  this.state.buttonState;
        if(buttonState !=='normal' && hasCameraPermissions) {
            return(
             <BarCodeScanner onBarCodeScanned = {scanned===true?undefined:this.handleBarCodeScanned} style = {StyleSheet.absoluteFillObject}/>
            )
        }
        else if(buttonState==='normal'){
        return(
            <KeyboardAvoidingView style = {styles.container} behavior = 'padding' enabled>
            <View style = {{flex:1,justifyContent:'center',alignItems:'center'}}>
                <View>
                 <Image source = {require('../assets/booklogo.jpg')} style = {{width:200,height:200}}/>
                 <Text style = {{textAlign:'center',fontSize:30}} >
                     Wily
                 </Text>
                </View>
               <View style = {styles.inputView}>
                     <TextInput style = {styles.inputBox} placeholder = 'Book Id' value = {this.state.scannedBookId} onChangeText = {(b)=>{
                                this.setState({
                                    scannedBookId:b
                                })    
                     }}/>
                     <TouchableOpacity style = {styles.scanButton} onPress = {()=>{
                         this.getCameraPermission('bookId');
                     }}>
                         <Text style = {styles.buttonText}>
                             Scan 
                         </Text>
                     </TouchableOpacity>
               </View>
               <View style = {styles.inputView}>
                     <TextInput style = {styles.inputBox} placeholder = 'Student Id' value = {this.state.scannedStudentId} onChangeText = {(s)=>{
                         this.setState({
                             scannedStudentId:s
                         })
                     }}/>
                     <TouchableOpacity style = {styles.scanButton} onPress = {()=>{
                         this.getCameraPermission('studentId');
                     }}>
                         <Text style = {styles.buttonText}>
                             Scan 
                         </Text>
                     </TouchableOpacity>
               </View>
               <TouchableOpacity style = {styles.submitButton} onPress = {async()=>{
                   this.handleTransaction();
               }}>
                   <Text style = {styles.submitButtonText}>
                       Submit
                   </Text>
               </TouchableOpacity>
            </View>
            </KeyboardAvoidingView>
        )
            }
    }

}
const styles = StyleSheet.create({
    displayText:{
         fontSize:15,
         textDecorationLine:'underline'
    },
    scanButton:{
        backgroundColor:'blue',
        width:100,
        borderWidth:1.5,
        borderLeftWidth:0,
        marginTop:0,
        height:40
    },
    buttonText:{
        fontSize:15,
        textAlign:'center',
        marginTop:10
    },
    inputView: {
        flexDirection: 'row',
        margin:20,
    },
    inputBox:{
        width:100,
        height:40,
        borderWidth:1.5,
        borderRightWidth:0,
        fontSize:20
    },
    submitButton:{
        backgroundColor:'green',
        width:100,
        height:50
    },
    submitButtonText:{
        padding:10,
        textAlign:'center',
        fontSize:20,
        fontWeight:'bold',
        color:'white'
    },
    container:{
        flex:1
    }
})