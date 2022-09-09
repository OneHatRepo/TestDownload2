import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import * as ExpoFileSystem from 'expo-file-system';

const FILES_DIR = ExpoFileSystem.documentDirectory,
	isDirectory = (path) => {
		return !path || !!path.match(/\/$/); // ends in a '/'
	},
	cachedFileExists = async (path = '') => {
		const info = await ExpoFileSystem.getInfoAsync(FILES_DIR + path);
		return info.exists;
	},
	createCacheSpace = async (path = '') => {
		const exists = await cachedFileExists(path);
		if (!isDirectory(path) || !exists) {
			return;
		}
		await ExpoFileSystem.makeDirectoryAsync(FILES_DIR + path, { intermediates: true });
	},
	deleteCachedFiles = async (path = '') => {
		const exists = await cachedFileExists(path);
		if (!exists) {
			return;
		}
		if (isDirectory(path)) {
			// Delete all contents of directory
			const cachedFiles = await ExpoFileSystem.readDirectoryAsync(FILES_DIR + path);
		
			let position = 0;
			let results = [];
			const batchSize = 10;
		
			// batching promise.all to avoid exessive promises call
			while (position < cachedFiles.length) {
				const itemsForBatch = cachedFiles.slice(position, position + batchSize);
				results = [...results, ...await Promise.all(itemsForBatch.map(async file => {// eslint-disable-line
					const info = await ExpoFileSystem.getInfoAsync(`${FILES_DIR}${path}${file}`)// eslint-disable-line
					return Promise.resolve({ file, modificationTime: info.modificationTime, size: info.size })
				}))];
				position += batchSize;
			}
		
			// cleanup cache, leave only 5000 most recent files
			const sorted = results.sort((a, b) => a.modificationTime - b.modificationTime);
		
			for (let i = 0; sorted.length - i > 8000; i += 1) { // may need to reduce down to 500
				await ExpoFileSystem.deleteAsync(`${FILES_DIR}${path}${sorted[i].file}`, { idempotent: true });
			}
		} else {
			// Just delete one file
			try {
				await ExpoFileSystem.deleteAsync(FILES_DIR + path, { idempotent: true });
			} catch (e) {
				// ignore errors when deleting a cached file
				debugger;
			}
		}
		
		await createCacheSpace(path);
	},
	getCachedFile = async (path = '') => {
		const exists = await cachedFileExists(path);
		if (!exists) {
			return null;
		}
		return FILES_DIR + path;
	},
	downloadAndCacheFile = async (remoteUri, fileUri, progressCallback = null) => {
		let exists = await cachedFileExists(fileUri);
		if (exists) { // Different! This is checking if it actually exists
			return;
		}

		const headers = getTokenHeaders();
		let downloadedFile;
		if (progressCallback) {
			// progressCallback is of signature: ({ totalBytesWritten, totalBytesExpectedToWrite }) => {}
			const downloadResumable = ExpoFileSystem.createDownloadResumable(remoteUri, FILES_DIR + fileUri, { headers }, progressCallback);
		debugger;
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
		
		exists = await cachedFileExists(fileUri);
		if (!exists) {
			throw Error('Could not download file');
		}
	}


export default function App() {

	useEffect(() => {
		(async () => {
			
			const
				remoteUri = 'https://github.com/OneHatRepo/TestDownload/blob/master/assets/test.mp3?raw=true', 
				fileUri = 'test.mp3',
				progressCallback = ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
					const downloadedPercent = totalBytesWritten / totalBytesExpectedToWrite;
					console.log(downloadedPercent);
				};
			downloadAndCacheFile(remoteUri, fileUri, progressCallback);

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
