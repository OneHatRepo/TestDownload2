import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import * as ExpoFileSystem from 'expo-file-system';


export default function App() {

	useEffect(() => {
		(async () => {

			const
				remoteUri = 'https://github.com/OneHatRepo/TestDownload/blob/master/assets/test.mp3?raw=true', 
				downloadResumable = ExpoFileSystem.createDownloadResumable(remoteUri, ExpoFileSystem.documentDirectory + 'test.mp3', null, ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
					const downloadedPercent = totalBytesWritten / totalBytesExpectedToWrite;
					console.log(downloadedPercent);
				}),
				downloadedFile = await downloadResumable.downloadAsync();
			if (downloadedFile.status !== 200) {
				throw new Error(downloadedFile);
			}

		})();
	}, [])

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
