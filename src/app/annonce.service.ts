import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnnonceService {
  private apiUrl = 'https://devapi.onemakan.com/v1/ads';

  constructor(private http: HttpClient) {}

  createAnnonce(annonceData: any, accessToken: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json' // Assuming JSON data is being sent
    });
    
    return this.http.post<any>(this.apiUrl, annonceData, { headers });
  }

  uploadImages(mediaData: any , accessToken: string): Observable<any> {
    const mediaUrl = 'https://devapi.onemakan.com/v1/medias';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });
    return this.http.post<any>(mediaUrl, mediaData ,{ headers } );
  }  


  uploadFile(file: File, accessToken: string): Promise<any> {
    const formData = new FormData();
    formData.append('media_file', file);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });

    return this.http.post<any>('https://devapi.onemakan.com/v1/medias', formData, { headers }).toPromise();
  }
}
