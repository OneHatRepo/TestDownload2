import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import * as ExpoFileSystem from 'expo-file-system';

const FILES_DIR = ExpoFileSystem.documentDirectory,
	downloadAndCacheFile = async (remoteUri, fileUri, progressCallback = null) => {
		let downloadedFile;
		if (progressCallback) {
			// progressCallback is of signature: ({ totalBytesWritten, totalBytesExpectedToWrite }) => {}
			const downloadResumable = ExpoFileSystem.createDownloadResumable(remoteUri, FILES_DIR + fileUri, {  }, progressCallback);
			downloadedFile = await downloadResumable.downloadAsync();
		} else {
			downloadedFile = await ExpoFileSystem.downloadAsync(remoteUri, FILES_DIR + fileUri, {
				headers,
				sessionType: ExpoFileSystem.FileSystemSessionType.FOREGROUND,
			})
		}
		if (downloadedFile.status !== 200) {
			throw new Error(downloadedFile);
		}
	};


export default function App() {

	useEffect(() => {
		(async () => {
			
			const
				remoteUri = 'https://github.com/OneHatRepo/TestDownload/blob/master/assets/test.mp3?raw=true', 
				fileUri = 'test.mp3',
				progressCallback = ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
					debugger;
					const downloadedPercent = totalBytesWritten / totalBytesExpectedToWrite;
					console.log(downloadedPercent);
				};
			await downloadAndCacheFile(remoteUri, fileUri, progressCallback);

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
