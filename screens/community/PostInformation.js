import React from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { useState } from 'react';
import { collection, query, getDocs} from 'firebase/firestore';
import { FIREBASE_DB } from '../../config/firebase';
import { Image } from 'react-native';
import { ROUTES } from '../../constants';
import Logo from '../../assets/icons/LOGO.svg';
import { Entypo } from '@expo/vector-icons';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { FIREBASE_AUTH } from '../../config/firebase';
import { deleteDoc, doc } from 'firebase/firestore';


import { setDoc, serverTimestamp } from 'firebase/firestore';
import { TextInput } from 'react-native';
import uuid from 'react-native-uuid';

const PostInformation = ({route}) => {
  const params = route.params ? route.params : "no post";
  const navigation = useNavigation();
  const [sessions, setSessions] = useState([]);
  const [replyText, setReplyText] = useState('');

  const fetchSessions = async () => {
    const q = query(collection(FIREBASE_DB, 'community-chat'));
    const querySnapshot = await getDocs(q);
    const sessionData = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.postId === params.postId) {
        sessionData.push({ id: doc.id, ...data });
      }
    });
    setSessions(sessionData);

  };

  useEffect(() => {
    const fetchSessionsAndSetState = async () => {
      try {
        await fetchSessions();
      } catch (error) { 
        console.log('Error fetching sessions: ', error);
      }
    };
  
    fetchSessionsAndSetState();
  }, []);

  const handlePost = (session) => {

    if (FIREBASE_AUTH.currentUser.uid !== session.userId) {
      return;
    }
    return (
      <Menu>
        <MenuTrigger>
          <Entypo name="dots-three-vertical" size={24} color="black" />
        </MenuTrigger>
        <MenuOptions>
          <MenuOption onSelect={() => navigation.navigate(ROUTES.ADD_POST_SCREEN)} text='Edit' />
          <MenuOption onSelect={() => deleteSession(session.postId, session.userId)}>
            <Text style={{ color: 'red' }}>Delete</Text>
          </MenuOption>
        </MenuOptions>
      </Menu>
    );
  };

  const deleteSession = async (postId, userId) => {
    try {
      if (FIREBASE_AUTH.currentUser.uid !== userId) {
        // alert('You can only delete your own post');
        return;
      }
      await deleteDoc(doc(FIREBASE_DB, 'community-chat', postId));
      await fetchSessions();
      navigation.navigate(ROUTES.COMMUNITY, {refresh: true});
    } catch (error) {
      console.log('Error deleting document: ', error);
    }
  };

  randomId = uuid.v4(); //randomly generated id

  const handleReply = async (postId) => {
    try {
      await setDoc(doc(FIREBASE_DB, 'community-comment', randomId, 'comments', parentId), {
        parentId: params.postId,
        postId: randomId, //randomly generated id
        replyAuthor: FIREBASE_AUTH.currentUser.displayName,
        replyContent: replyText,
        createdAt: serverTimestamp(),
        userId: FIREBASE_AUTH.currentUser.uid,
      });
      setReplyText(''); // Clear the reply text input after submission
      await fetchSessions(); // Update the sessions with the new reply
    } catch (error) {
      console.log("Error writing document: ", error);
    } 
  };

  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.container}>
        {sessions.map((session, index) => (
          <View key={index} style={styles.sessionContainer}>
            <View style={styles.sessionHeader}>
              <View style={styles.sessionHeaderLeft}>
              {session.photoURL ? (
                  <Image
                    source={{ uri: session.photoURL }}
                    width={24} height={24}
                    borderRadius={12}
                    style={styles.mr7}
                  />
                ) : (
                  <Logo width={24} height={24} style={styles.mr7} />
                )}
                <Text style={{ fontSize: 16 }}> u/{session.postAuthor ? session.postAuthor : 'No name'}</Text>
              </View>
              {handlePost(session)}
            </View>
            <View style={styles.sessionBlock}>
              <Text style={{ color: 'grey', fontSize: 11 }}>{session.postCreatedDateTime}</Text>
            </View>
              <View style={styles.sessionBlock}>
                <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{session.postTopic}</Text>
              </View>
              <View style={styles.sessionBlock}>
                <Text style={styles.sessionText}>{session.postContent ? session.postContent : 'No content'}</Text>
              </View>
          </View>
        ))}
        <View style={styles.replyContainer}>
          <TextInput
            style={styles.replyInput}
            placeholder="Type your reply"
            value={replyText}
            onChangeText={setReplyText}
            multiline
          />
          <TouchableOpacity
            style={styles.replyButton}
            onPress={() => handleReply(params.postId)}
            disabled={!replyText} // Disable the button if the reply text is empty
          >
            <Text style={styles.replyButtonText}>Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default PostInformation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
  },
  sessionContainer: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
  sessionBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addButton: {
    marginTop: 10,
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  mr7: {
    marginRight: 7,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sessionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginTop: 330,
  },
  replyInput: {
    height: 50,  //size of the reply input box
    padding: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  replyButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  replyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
