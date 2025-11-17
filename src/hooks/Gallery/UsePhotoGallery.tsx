import { useState, useEffect } from 'react';
import { isPlatform } from '@ionic/react';

import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory, ReadFileResult } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
}

const PHOTOS_KEY = 'photos';

export function usePhotoGallery() {
  const [photos, setPhotos] = useState<UserPhoto[]>([]);

  // Load cached photos metadata from Preferences on mount
  useEffect(() => {
    const loadSaved = async () => {
      const { value } = await Preferences.get({ key: PHOTOS_KEY });
      if (!value) return;
      try {
        const parsed: UserPhoto[] = JSON.parse(value);
        // On native, convert file URIs to a form usable in the webview
        if (isPlatform('hybrid')) {
          const converted = parsed.map((p) => {
            return {
              filepath: p.filepath,
              webviewPath: Capacitor.convertFileSrc(p.filepath),
            } as UserPhoto;
          });
          setPhotos(converted);
        } else {
          setPhotos(parsed);
        }
      } catch (e) {
        console.warn('Failed to parse saved photos', e);
      }
    };

    loadSaved();
  }, []);

  const takePhoto = async () => {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 90,
    });

    const fileName = new Date().getTime() + '.jpeg';

    const saved = await savePicture(photo, fileName);

    // persist the new array and update state
    setPhotos((prev) => {
      const newPhotos = [saved, ...prev];
      Preferences.set({ key: PHOTOS_KEY, value: JSON.stringify(newPhotos) });
      return newPhotos;
    });
  };

  return {
    photos,
    takePhoto,
  };
}

async function savePicture(photo: Photo, fileName: string): Promise<UserPhoto> {
  // Hybrid (native) path: save the file into the device filesystem and return a webview-friendly path
  if (isPlatform('hybrid')) {
    const base64Data = await readAsBase64(photo);
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data,
    });

    // savedFile.uri is a file URI that needs converting for the webview
    return {
      filepath: savedFile.uri,
      webviewPath: Capacitor.convertFileSrc(savedFile.uri),
    };
  }

  // Web path: no filesystem available, use the webPath directly
  return {
    filepath: fileName,
    webviewPath: photo.webPath,
  };
}

async function readAsBase64(photo: Photo): Promise<string> {
  // On hybrid, Filesystem.readFile supports reading from the path returned by the Camera plugin
  if (isPlatform('hybrid')) {
    // photo.path is available on native
  const file = await Filesystem.readFile({ path: photo.path! });
  return file.data as string;
  }

  // Web platform: fetch the image, convert to blob, then to base64
  const response = await fetch(photo.webPath!);
  const blob = await response.blob();

  return await convertBlobToBase64(blob) as string;
}

function convertBlobToBase64(blob: Blob): Promise<string | ArrayBuffer | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
}