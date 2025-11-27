import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileDemo() {
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [showMeetingsList, setShowMeetingsList] = useState(false);
  const [meetings, setMeetings] = useState([]);
  const [meetingsLoading, setMeetingsLoading] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [isFiltering, setIsFiltering] = useState(false);
  const [meetingForm, setMeetingForm] = useState({
    collaboratorsId: '2, 3',
    startTime: '2025-01-10T10:00:00',
    endTime: '2025-01-10T11:00:00',
    agenda: 'Project planning meeting'
  });
  const [collaboratorIds, setCollaboratorIds] = useState([2, 3]); // Array to store individual IDs
  const [currentCollaboratorInput, setCurrentCollaboratorInput] = useState(''); // Current input field value
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedProfile = await AsyncStorage.getItem('userProfile');
      const storedUserId = await AsyncStorage.getItem('userId');
      
      console.log('Stored profile data:', storedProfile);
      console.log('Stored user ID:', storedUserId);
      
      if (storedProfile) {
        const profileData = JSON.parse(storedProfile);
        console.log('Parsed profile data:', profileData);
        
        // Check if this is login-based data due to CORS issues
        const isCorsLimitedData = profileData.corsIssue === true;
        
        setUser({
          avatar: require('../assets/images/vet.avif'),
          name: profileData.name || profileData.username || 'User',
          username: profileData.username || 'unknown',
          designation: profileData.designation || (isCorsLimitedData ? 'Team Member' : 'No designation'),
          email: profileData.email || 'Email not available',
          location: profileData.location || 'Location not specified',
          bio: profileData.bio || (isCorsLimitedData 
            ? `Welcome ${profileData.username || 'User'}! Full profile details need backend CORS configuration for /api/user/ endpoints.`
            : `${profileData.designation || 'Professional'} working on satellite task management and automation systems.`),
          joined: profileData.createdAt?.split('T')[0] || profileData.joined || 'Recently',
          stats: {
            tasksCompleted: profileData.tasksCompleted || 0,
            missions: profileData.missions || 0,
            followers: profileData.followers || 0,
          },
          skills: profileData.skills || [profileData.designation || 'Team Member', 'Task Management', 'System Operations'],
          recent: profileData.recent || (isCorsLimitedData ? [
            'Login successful',
            'Basic profile created from login data',
            'Backend needs CORS config for /api/user/ endpoints'
          ] : [
            `Profile created as ${profileData.designation || 'team member'}`,
            'Joined the satellite task management system',
            'Account setup completed',
          ]),
        });
      } else {
        // Try to fetch fresh data if no stored profile
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          console.log('No stored profile, fetching fresh data for user:', userId);
          await fetchUserProfile(userId);
        } else {
          // Final fallback to demo data
          setUser({
            avatar: require('../assets/images/vet.avif'),
            name: 'Demo User',
            username: 'demo_user',
            designation: 'Satellite Ops Engineer',
            email: 'demo@example.com',
            location: 'Birmingham, UK',
            bio: 'Building reliable task automation for satellite telemetry and mission operations.',
            joined: '2023-08-14',
            stats: {
              tasksCompleted: 124,
              missions: 8,
              followers: 312,
            },
            skills: ['Telemetry', 'Ground Systems', 'Python', 'Rust', 'RTOS'],
            recent: [
              'Created mission plan for Sat-42',
              'Fixed telemetry parser bug',
              'Deployed health-check cron-job',
            ],
          });
        }
      }
      
      if (storedUserId) {
        setUserId(storedUserId);
      }
    } catch (e) {
      console.log('Failed to load user data:', e);
    }
  };

  const fetchUserProfile = async (userId) => {
    try {
      console.log('Fetching profile for user ID:', userId);
      const response = await fetch(`http://localhost:8080/api/user/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const profileData = await response.json();
        console.log('Fresh profile data received:', profileData);
        
        // Store the fresh data
        await AsyncStorage.setItem('userProfile', JSON.stringify(profileData));
        
        // Update the user state with fresh data
        setUser({
          avatar: require('../assets/images/vet.avif'),
          name: profileData.name,
          username: profileData.username,
          designation: profileData.designation,
          email: profileData.email,
          location: profileData.location || 'Location not specified',
          bio: profileData.bio || `${profileData.designation} working on satellite task management and automation systems.`,
          joined: profileData.createdAt?.split('T')[0] || profileData.joined || 'Recently',
          stats: {
            tasksCompleted: profileData.tasksCompleted || 0,
            missions: profileData.missions || 0,
            followers: profileData.followers || 0,
          },
          skills: profileData.skills || [profileData.designation, 'Task Management', 'System Operations'],
          recent: profileData.recent || [
            `Profile created as ${profileData.designation}`,
            'Joined the satellite task management system',
            'Account setup completed',
          ],
        });
      } else {
        console.log('Failed to fetch profile, status:', response.status);
        // Fallback to demo data if API fails
        setUser({
          avatar: require('../assets/images/vet.avif'),
          name: 'Profile Load Error',
          username: 'api_error',
          designation: 'Profile API Issue',
          email: 'error@localhost',
          location: `API Error - Status ${response.status}`,
          bio: 'There was an issue loading your profile from the API. Please try refreshing.',
          joined: 'Error occurred',
          stats: { tasksCompleted: 0, missions: 0, followers: 0 },
          skills: ['Refresh Profile', 'Check API', 'Debug Mode'],
          recent: ['Profile API call failed', 'Login worked successfully', 'Try refresh button'],
        });
      }
    } catch (e) {
      console.log('Error fetching user profile:', e);
      // Show network error info in profile
      setUser({
        avatar: require('../assets/images/vet.avif'),
        name: 'Network Error',
        username: 'network_error',
        designation: 'Connection Issue',
        email: 'error@network',
        location: 'Check network connection',
        bio: 'Unable to connect to the profile API. Please check your network connection and backend server.',
        joined: 'Error occurred',
        stats: { tasksCompleted: 0, missions: 0, followers: 0 },
        skills: ['Check Network', 'Verify Backend', 'Refresh Profile'],
        recent: [
          'Network error occurred',
          'Login API worked fine',
          'Profile API connection failed',
        ],
      });
    }
  };

  const fetchMeetings = async () => {
    if (!userId) {
      setError('User ID not found - please log in again');
      return;
    }

    setMeetingsLoading(true);
    setError('');
    
    try {
      console.log(`Fetching meetings for user ${userId}`);
      
      const response = await fetch(`http://localhost:8080/api/meetings/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      console.log('Meetings fetch response status:', response.status);
      
      if (response.ok) {
        const meetingsData = await response.json();
        console.log('Meetings data received:', meetingsData);
        
        // Handle both single meeting object and array of meetings
        const meetingsArray = Array.isArray(meetingsData) ? meetingsData : [meetingsData];
        setMeetings(meetingsArray);
        setShowMeetingsList(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || `Failed to fetch meetings (${response.status})`);
      }
    } catch (e) {
      console.log('Error fetching meetings:', e);
      setError('Network error - check connection and backend server');
    } finally {
      setMeetingsLoading(false);
    }
  };

  const addCollaboratorId = () => {
    const id = parseInt(currentCollaboratorInput.trim());
    if (!isNaN(id) && id > 0 && !collaboratorIds.includes(id)) {
      const newIds = [...collaboratorIds, id];
      setCollaboratorIds(newIds);
      setMeetingForm({...meetingForm, collaboratorsId: newIds.join(', ')});
      setCurrentCollaboratorInput('');
    }
  };

  const removeCollaboratorId = (idToRemove) => {
    const newIds = collaboratorIds.filter(id => id !== idToRemove);
    setCollaboratorIds(newIds);
    setMeetingForm({...meetingForm, collaboratorsId: newIds.join(', ')});
  };

  const handleCollaboratorKeyPress = (event) => {
    if (event.nativeEvent.key === 'Enter') {
      event.preventDefault();
      addCollaboratorId();
    }
  };

  const deleteMeeting = async (meeting) => {
    // Check if current user is the initiator
    if (!userId || parseInt(userId) !== parseInt(meeting.initiatorId)) {
      console.log('Delete denied: User is not the meeting initiator', {
        currentUserId: userId,
        initiatorId: meeting.initiatorId
      });
      return;
    }

    // Try different possible ID fields
    const meetingId = meeting.id || meeting.meetingId || meeting._id || meeting.ID;
    
    if (!meetingId) {
      console.log('Meeting object:', meeting);
      console.log('No meeting ID found in any expected field');
      return;
    }

    try {
      console.log(`Deleting meeting with ID: ${meetingId}`, meeting);
      
      const response = await fetch(`http://localhost:8080/api/meetings/delete/${meetingId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      
      console.log('Delete meeting response status:', response.status);
      
      if (response.ok) {
        // Remove the meeting from the local state using the same ID field
        setMeetings(meetings.filter(m => {
          const mId = m.id || m.meetingId || m._id || m.ID;
          return mId !== meetingId;
        }));
      } else {
        // Silent failure - no user notification
        console.log('Failed to delete meeting:', response.status);
      }
    } catch (e) {
      // Silent failure - no user notification
      console.log('Error deleting meeting:', e);
    }
  };

  const fetchMeetingsByDate = async () => {
    if (!userId) {
      setError('User ID not found - please log in again');
      return;
    }

    if (!filterDate.trim()) {
      setError('Please enter a date to filter (Format: YYYY-MM-DD)');
      return;
    }

    // Validate ISO date format (same as create meeting)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(filterDate)) {
      setError('Date must be in format: YYYY-MM-DD (e.g., 2025-01-15)');
      return;
    }

    setIsFiltering(true);
    setError('');
    
    try {
      console.log(`Filtering meetings for user ${userId} on date: ${filterDate}`);
      
      const response = await fetch(`http://localhost:8080/api/meetings/${userId}/filter?date=${filterDate}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      console.log('Filtered meetings response status:', response.status);
      
      if (response.ok) {
        const filteredMeetings = await response.json();
        console.log('Filtered meetings data:', filteredMeetings);
        
        // Handle both single meeting object and array of meetings
        const meetingsArray = Array.isArray(filteredMeetings) ? filteredMeetings : [filteredMeetings];
        setMeetings(meetingsArray);
        setSuccess(`Found ${meetingsArray.length} meeting(s) for ${filterDate}`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 404) {
          setMeetings([]);
          setError(`No meetings found for ${filterDate}`);
        } else {
          setError(errorData.message || `Failed to filter meetings (${response.status})`);
        }
      }
    } catch (e) {
      console.log('Error filtering meetings:', e);
      setError('Network error - check connection and backend server');
    } finally {
      setIsFiltering(false);
    }
  };

  const clearFilter = () => {
    setFilterDate('');
    setError('');
    setSuccess('');
    fetchMeetings(); // Reload all meetings
  };

  const handleAddMeeting = async () => {
    setError('');
    setSuccess('');
    
    if (!userId) {
      setError('User ID not found - please log in again');
      return;
    }

    // Validate all required fields
    if (!meetingForm.collaboratorsId.trim()) {
      setError('Please enter collaborator IDs');
      return;
    }

    // Convert comma-separated string to array of numbers
    const collaboratorIds = meetingForm.collaboratorsId.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    if (collaboratorIds.length === 0) {
      setError('Please enter valid collaborator IDs (numbers separated by commas)');
      return;
    }
    if (!meetingForm.startTime.trim()) {
      setError('Please enter start time');
      return;
    }
    if (!meetingForm.endTime.trim()) {
      setError('Please enter end time');
      return;
    }
    if (!meetingForm.agenda.trim()) {
      setError('Please enter meeting agenda');
      return;
    }

    // Validate time format (YYYY-MM-DDTHH:MM:SS or YYYY-MM-DDTHH:MM)
    const timeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;
    if (!timeRegex.test(meetingForm.startTime)) {
      setError('Start time must be in format: YYYY-MM-DDTHH:MM:SS or YYYY-MM-DDTHH:MM');
      return;
    }
    if (!timeRegex.test(meetingForm.endTime)) {
      setError('End time must be in format: YYYY-MM-DDTHH:MM:SS or YYYY-MM-DDTHH:MM');
      return;
    }

    setLoading(true);
    try {
      console.log(`Creating meeting for user ${userId}:`, meetingForm);
      
      const res = await fetch(`http://localhost:8080/api/meetings/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meetingForm),
      });

      console.log('Meeting creation response status:', res.status);
      const data = await res.json().catch(() => ({}));
      console.log('Meeting creation response data:', data);

      if (res.status === 200 || res.status === 201) {
        setSuccess('Meeting created successfully!');
        setMeetingForm({
          collaboratorsId: '',
          startTime: '',
          endTime: '',
          agenda: ''
        });
        setCollaboratorIds([]);
        setCurrentCollaboratorInput('');
        setTimeout(() => setShowMeetingForm(false), 1500);
        return;
      }

      setError(data.error || data.message || `Server error (${res.status})`);
    } catch (e) {
      console.log('Meeting creation error:', e);
      setError('Network error — check connection and backend server');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#081426" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#081426" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image source={user.avatar || require('../assets/images/vet.avif')} style={styles.avatar} />
            <View style={styles.headerText}>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.handle}>@{user.username}</Text>
              <Text style={styles.designation}>{user.designation}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.refreshButton} onPress={loadUserData} activeOpacity={0.85}>
            <Ionicons name="refresh" size={20} color="#9fcfff" />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.paragraph}>{user.bio || 'Building reliable task automation for satellite telemetry and mission operations.'}</Text>

          <View style={styles.rowWrap}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{user.stats?.tasksCompleted || 0}</Text>
              <Text style={styles.statLabel}>Tasks</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{user.stats?.missions || 0}</Text>
              <Text style={styles.statLabel}>Missions</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{user.stats?.followers || 0}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}> 
          <Text style={styles.sectionTitle}>Contact</Text>
          <View style={styles.contactRow}><Ionicons name="mail" size={18} color="#bfe0ff" /><Text style={styles.contactText}>{user.email || 'No email provided'}</Text></View>
          <View style={styles.contactRow}><Ionicons name="location" size={18} color="#bfe0ff" /><Text style={styles.contactText}>{user.location || 'Location not specified'}</Text></View>
          <View style={styles.contactRow}><Ionicons name="calendar" size={18} color="#bfe0ff" /><Text style={styles.contactText}>Joined {user.joined || 'Recently'}</Text></View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.tags}>
            {(user.skills || ['Developer', 'Task Management', 'System Operations']).map((s) => (
              <View key={s} style={styles.tag}><Text style={styles.tagText}>{s}</Text></View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {(user.recent || [
            'Profile created successfully',
            'Joined the satellite task management system', 
            'Account setup completed'
          ]).map((r, i) => (
            <View key={i} style={styles.activityRow}><Ionicons name="time" size={16} color="#9fcfff" /><Text style={styles.activityText}>{r}</Text></View>
          ))}
        </View>

        <TouchableOpacity style={styles.addButton} onPress={() => setShowMeetingForm(true)} activeOpacity={0.85}>
          <Ionicons name="add" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.addButtonText}>Create Meeting</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={fetchMeetings} activeOpacity={0.85}>
          <Ionicons name="calendar" size={20} color="#9fcfff" style={{ marginRight: 8 }} />
          <Text style={styles.secondaryButtonText}>{meetingsLoading ? 'Loading...' : 'See Meetings I Created'}</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showMeetingForm} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Meeting</Text>
              <TouchableOpacity onPress={() => setShowMeetingForm(false)}>
                <Ionicons name="close" size={24} color="#cfe8ff" />
              </TouchableOpacity>
            </View>

            {success ? <Text style={styles.successText}>{success}</Text> : null}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Collaborators ID</Text>
              <Text style={styles.fieldHelper}>Enter ID and press Enter to add</Text>
              
              {/* Selected IDs Display */}
              {collaboratorIds.length > 0 && (
                <View style={styles.selectedIdsContainer}>
                  {collaboratorIds.map((id) => (
                    <View key={id} style={styles.selectedIdTag}>
                      <Text style={styles.selectedIdText}>{id}</Text>
                      <TouchableOpacity 
                        onPress={() => removeCollaboratorId(id)}
                        style={styles.removeIdButton}
                      >
                        <Ionicons name="close-circle" size={16} color="rgba(255,100,100,0.8)" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              
              {/* Input Field */}
              <TextInput
                style={styles.formInput}
                value={currentCollaboratorInput}
                onChangeText={setCurrentCollaboratorInput}
                onKeyPress={handleCollaboratorKeyPress}
                placeholder="Enter collaborator ID (e.g., 5)"
                placeholderTextColor="rgba(200,220,255,0.5)"
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={addCollaboratorId}
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Start Time</Text>
              <Text style={styles.fieldHelper}>Format: YYYY-MM-DDTHH:MM:SS or YYYY-MM-DDTHH:MM</Text>
              <TextInput
                style={styles.formInput}
                value={meetingForm.startTime}
                onChangeText={(text) => setMeetingForm({...meetingForm, startTime: text})}
                placeholder="2025-01-15T14:00:00"
                placeholderTextColor="rgba(200,220,255,0.5)"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>End Time</Text>
              <Text style={styles.fieldHelper}>Format: YYYY-MM-DDTHH:MM:SS or YYYY-MM-DDTHH:MM</Text>
              <TextInput
                style={styles.formInput}
                value={meetingForm.endTime}
                onChangeText={(text) => setMeetingForm({...meetingForm, endTime: text})}
                placeholder="2025-01-15T15:00:00"
                placeholderTextColor="rgba(200,220,255,0.5)"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Meeting Agenda</Text>
              <Text style={styles.fieldHelper}>Describe the meeting purpose and topics</Text>
              <TextInput
                style={[styles.formInput, { height: 80, textAlignVertical: 'top' }]}
                value={meetingForm.agenda}
                onChangeText={(text) => setMeetingForm({...meetingForm, agenda: text})}
                placeholder="Project planning meeting to discuss upcoming features and timeline"
                placeholderTextColor="rgba(200,220,255,0.5)"
                multiline
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddMeeting} activeOpacity={0.85}>
              <Text style={styles.submitText}>{loading ? 'Creating...' : 'Create Meeting'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showMeetingsList} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>My Meetings</Text>
              <TouchableOpacity onPress={() => setShowMeetingsList(false)}>
                <Ionicons name="close" size={24} color="#cfe8ff" />
              </TouchableOpacity>
            </View>

            {/* Date Filter Section */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Filter by Date</Text>
              <Text style={styles.fieldHelper}>Format: YYYY-MM-DD (e.g., 2025-01-15)</Text>
              <View style={styles.filterRow}>
                <TextInput
                  style={styles.dateInput}
                  value={filterDate}
                  onChangeText={setFilterDate}
                  placeholder="2025-01-15"
                  placeholderTextColor="rgba(200,220,255,0.5)"
                />
                <TouchableOpacity 
                  style={styles.filterButton} 
                  onPress={fetchMeetingsByDate}
                  activeOpacity={0.85}
                >
                  <Text style={styles.filterButtonText}>{isFiltering ? 'Filtering...' : 'Filter'}</Text>
                </TouchableOpacity>
                {filterDate ? (
                  <TouchableOpacity 
                    style={styles.clearButton} 
                    onPress={clearFilter}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="close-circle" size={20} color="#ffccd1" />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {success ? <Text style={styles.successText}>{success}</Text> : null}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <ScrollView style={{ maxHeight: 400 }}>
              {meetings.length > 0 ? (
                meetings.map((meeting, index) => (
                  <View key={index} style={styles.meetingCard}>
                    <View style={styles.meetingHeader}>
                      <View style={styles.meetingTitleContainer}>
                        <Ionicons name="calendar" size={16} color="#9fcfff" />
                        <Text style={styles.meetingTitle}>Meeting #{index + 1}</Text>
                      </View>
                      {/* Only show delete button if current user is the initiator */}
                      {userId && parseInt(userId) === parseInt(meeting.initiatorId) && (
                        <TouchableOpacity 
                          onPress={() => deleteMeeting(meeting)}
                          style={styles.deleteButton}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="trash" size={16} color="rgba(255,100,100,0.8)" />
                        </TouchableOpacity>
                      )}
                    </View>
                    
                    <View style={styles.meetingDetail}>
                      <Ionicons name="person" size={14} color="#bfe0ff" />
                      <Text style={styles.meetingDetailText}>Initiator: {meeting.initiatorId} {parseInt(userId) === parseInt(meeting.initiatorId) ? '(You)' : ''}</Text>
                    </View>
                    
                    <View style={styles.meetingDetail}>
                      <Ionicons name="people" size={14} color="#bfe0ff" />
                      <Text style={styles.meetingDetailText}>Collaborators: {meeting.collaboratorsId}</Text>
                    </View>
                    
                    <View style={styles.meetingDetail}>
                      <Ionicons name="finger-print" size={14} color="#bfe0ff" />
                      <Text style={styles.meetingDetailText}>ID: {meeting.id || meeting.meetingId || meeting._id || meeting.ID || 'No ID'}</Text>
                    </View>
                    
                    <View style={styles.meetingDetail}>
                      <Ionicons name="time" size={14} color="#bfe0ff" />
                      <Text style={styles.meetingDetailText}>Start: {new Date(meeting.startTime).toISOString().slice(0, 10)} {new Date(meeting.startTime).toLocaleTimeString()}</Text>
                      <Text style={styles.formatHint}>{meeting.startTime}</Text>
                    </View>
                    
                    <View style={styles.meetingDetail}>
                      <Ionicons name="time" size={14} color="#bfe0ff" />
                      <Text style={styles.meetingDetailText}>End: {new Date(meeting.endTime).toISOString().slice(0, 10)} {new Date(meeting.endTime).toLocaleTimeString()}</Text>
                      <Text style={styles.formatHint}>{meeting.endTime}</Text>
                    </View>
                    
                    <View style={styles.meetingDetail}>
                      <Ionicons name="document-text" size={14} color="#bfe0ff" />
                      <Text style={styles.meetingDetailText}>Agenda: {meeting.agenda}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="calendar-outline" size={48} color="rgba(207,232,255,0.3)" />
                  <Text style={styles.emptyStateText}>
                    {filterDate ? `No meetings found for ${filterDate}` : 'No meetings found'}
                  </Text>
                  <Text style={styles.emptyStateSubtext}>
                    {filterDate ? 'Try a different date or clear the filter' : 'Create your first meeting to see it here'}
                  </Text>
                </View>
              )}
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.refreshMeetingsButton} 
              onPress={fetchMeetings} 
              activeOpacity={0.85}
            >
              <Ionicons name="refresh" size={18} color="#9fcfff" style={{ marginRight: 6 }} />
              <Text style={styles.refreshMeetingsText}>Refresh Meetings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#041226' },
  scroll: { padding: 18, paddingTop: 100, paddingBottom: 36 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 84, height: 84, borderRadius: 42, borderWidth: 2, borderColor: 'rgba(191,224,255,0.12)' },
  refreshButton: { backgroundColor: 'rgba(159,207,255,0.1)', padding: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(159,207,255,0.2)' },
  headerText: { marginLeft: 12 },
  name: { color: '#e8f7ff', fontSize: 20, fontWeight: '700' },
  handle: { color: '#9fcfff', fontSize: 13, marginTop: 2 },
  designation: { color: '#bfe0ff', fontSize: 13, marginTop: 6 },
  card: { marginTop: 12, backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  sectionTitle: { color: '#cfe8ff', fontWeight: '700', marginBottom: 8 },
  paragraph: { color: 'rgba(235,245,255,0.85)', lineHeight: 20 },
  rowWrap: { flexDirection: 'row', marginTop: 12, justifyContent: 'space-between' },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { color: '#b6ffd6', fontSize: 18, fontWeight: '800' },
  statLabel: { color: '#cfe8ff', fontSize: 12, marginTop: 4 },
  contactRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  contactText: { color: 'rgba(235,245,255,0.8)', marginLeft: 8 },
  tags: { flexDirection: 'row', flexWrap: 'wrap' },
  tag: { backgroundColor: 'rgba(191,224,255,0.06)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, marginRight: 8, marginBottom: 8 },
  tagText: { color: '#cfe8ff', fontWeight: '700' },
  activityRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  activityText: { color: 'rgba(235,245,255,0.85)', marginLeft: 8 },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(191,224,255,0.1)', paddingVertical: 12, borderRadius: 10, marginTop: 12, borderWidth: 1, borderColor: 'rgba(191,224,255,0.12)' },
  addButtonText: { color: '#fff', fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { backgroundColor: '#041226', borderRadius: 12, padding: 20, width: '100%', maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { color: '#e8f7ff', fontSize: 20, fontWeight: '700' },
  formField: { marginBottom: 12 },
  fieldLabel: { color: '#cfe8ff', marginBottom: 4, fontWeight: '700' },
  fieldHelper: { color: 'rgba(207,232,255,0.6)', fontSize: 12, marginBottom: 6 },
  formInput: { backgroundColor: 'rgba(255,255,255,0.02)', color: '#fff', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  submitButton: { backgroundColor: 'rgba(255,255,255,0.12)', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  submitText: { color: '#fff', fontWeight: '700' },
  secondaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(159,207,255,0.1)', paddingVertical: 12, borderRadius: 10, marginTop: 8, borderWidth: 1, borderColor: 'rgba(159,207,255,0.15)' },
  secondaryButtonText: { color: '#9fcfff', fontWeight: '700' },
  meetingCard: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  meetingHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  meetingTitleContainer: { flexDirection: 'row', alignItems: 'center' },
  meetingTitle: { color: '#e8f7ff', fontWeight: '700', marginLeft: 6 },
  deleteButton: { padding: 8, borderRadius: 6, backgroundColor: 'rgba(255,100,100,0.1)', borderWidth: 1, borderColor: 'rgba(255,100,100,0.2)' },
  meetingDetail: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  meetingDetailText: { color: 'rgba(235,245,255,0.85)', marginLeft: 6, flex: 1 },
  formatHint: { color: 'rgba(159,207,255,0.5)', fontSize: 10, marginLeft: 20, fontStyle: 'italic' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyStateText: { color: '#cfe8ff', fontSize: 16, fontWeight: '700', marginTop: 12 },
  emptyStateSubtext: { color: 'rgba(207,232,255,0.6)', fontSize: 14, marginTop: 4, textAlign: 'center' },
  refreshMeetingsButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(159,207,255,0.1)', paddingVertical: 10, borderRadius: 8, marginTop: 12, borderWidth: 1, borderColor: 'rgba(159,207,255,0.15)' },
  refreshMeetingsText: { color: '#9fcfff', fontWeight: '700' },
  filterSection: { backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  selectedIdsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8, gap: 6 },
  selectedIdTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(159,207,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(159,207,255,0.3)' },
  selectedIdText: { color: '#9fcfff', fontSize: 14, fontWeight: '600', marginRight: 4 },
  removeIdButton: { marginLeft: 2 },
  filterLabel: { color: '#cfe8ff', fontWeight: '700', marginBottom: 8 },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateInput: { backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', flex: 1 },
  filterButton: { backgroundColor: 'rgba(159,207,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(159,207,255,0.3)' },
  filterButtonText: { color: '#9fcfff', fontWeight: '700' },
  clearButton: { backgroundColor: 'rgba(255,204,209,0.1)', padding: 6, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,204,209,0.2)' },
  successText: { color: '#b6ffd6', marginBottom: 8, textAlign: 'center', fontWeight: '700' },
  errorText: { color: '#ffccd1', marginBottom: 8, textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#cfe8ff', fontSize: 16 },
});
