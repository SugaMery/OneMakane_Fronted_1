import { Component, EventEmitter, Output } from '@angular/core';
import { AuthGuard } from '../auth.guard';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { CategoryService } from '../category.service';
import { AnnonceService } from '../annonce.service';

interface Category {
  active: boolean;
  created_at: string;
  id: number;
  model: any; // Adjust this type according to the actual type of 'model'
  name: string;
  parent_id: number | null;
  slug: string | null;
  url: string | null;
}
@Component({
  selector: 'app-page-account',
  templateUrl: './page-account.component.html',
  styleUrl: './page-account.component.css'
})
export class PageAccountComponent {
    userInfo: any;
    loggedInUserName: string | undefined;
  
    deletedImages: string[] = [];
    uploadedImages: string[] = [];
  
    categories: Category[] = [];
    formData = {
      titre: '',
      description: '',
      prix: '',
      category_id: 0,
      state: '',
      urgent: false,
      highlighted: false,
      ville: '',
      code_postal: '',
      files: [] // Contiendra les fichiers sélectionnés
    };
    formAds = {
      "user_id": 29,
      "category_id": 54,
      "title": "minus corrupti mollitia",
      "description": "Ea impedit tenetur dolor ut tempore magnam distinctio ullam. Dolorem nesciunt hic sunt ullam deleniti quibusdam.",
      "state": "good",
      "urgent": true,
      "highlighted": true,
      "price": 94506.53,
      "city": "Pittsfield",
      "postal_code": "77807-3426",
      "medias": {}
    };
    selectedOption: Category = { 
      active: false,
      created_at: "",
      id: 0,
      model: null,
      name: "",
      parent_id: null,
      slug: null,
      url: null
    };
    uploadedImageIds: number[] = [];
  
    optionsVisible: boolean = false;
    urgentChecked: boolean = false;
    highlightedChecked: boolean = false;
    uploadedImage: string[] = [];
    selectedFiles: File[] = [];
    constructor(
      private authService: AuthGuard,
      private router: Router,
      private annonceService: AnnonceService,
      private userService: UserService,
      private categoryService: CategoryService
    ) {}
  
    ngOnInit(): void {
      this.getUserInfo();
      this.fetchCategories();
      
    }
  
    getUserInfo(): void {
      if (typeof localStorage !== 'undefined') {
        const userId = localStorage.getItem('loggedInUserId');
        const accessToken = localStorage.getItem('loggedInUserToken');
        if (userId && accessToken) {
          this.userService.getUserInfoById(Number(userId), accessToken).subscribe(userInfo => {
            this.userInfo= userId;
            this.loggedInUserName = `${userInfo.data.first_name} ${userInfo.data.last_name}`;
          });
        }
      }
    }
  
    fetchCategories(): void {
      const accessToken = localStorage.getItem('loggedInUserToken');
      this.categoryService.getCategoriesFrom(accessToken!).subscribe(
        categories => {
          this.categories = categories.data.filter((category: Category) => category.active === true);
          console.log('Filtered Categories:', this.categories);
        },
        error => {
          console.error('Error fetching categories: ', error);
        }
      );
    }

  
    uploadFiles() {
      const accessToken = localStorage.getItem('loggedInUserToken');
      if (!accessToken) {
        console.error('Access token not found in local storage.');
        return;
      }
  
      this.selectedFiles.forEach(file => {
        this.annonceService.uploadFile(file, accessToken).then(response => {
          // Assuming response contains the URL of the uploaded image
          // You can handle the response as needed
          console.log('File uploaded successfully:', response);
        }).catch(error => {
          console.error('Error uploading file:', error);
        });
      });
  
      // Clear selected files array after uploading
      this.selectedFiles = [];
    }
    
    onFileSelected(event: any) {
      console.log('tset',this.userInfo.data);
      const userId = localStorage.getItem('loggedInUserId');
      console.log("userId : " + userId);
      const files: FileList = event.target.files;
      //this.uploadFile(files[0]);
      
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file: File = files[i];
          const reader: FileReader = new FileReader();
          this.selectedFiles.push(file);

          console.log("Nom du fichier:", file.name);
          console.log("Type de fichier:", file.type);
          console.log("Taille du fichier:", file.size);
          console.log("Dernière modification du fichier:", file.lastModified);


          reader.onload = (e) => {
            const imageDataURL: string = e.target!.result as string;
            this.uploadedImages.push(imageDataURL);

          
          };
          reader.readAsDataURL(file);
        }
      }
    }
  
    deleteImage(index: number) {
      if (index > -1 && index < this.uploadedImages.length) {
        const deletedImage = this.uploadedImages.splice(index, 1)[0];
        if (!this.deletedImages.includes(deletedImage)) {
          this.deletedImages.push(deletedImage);
        }
      }
    }
  
    replaceImage(index: number) {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.addEventListener('change', (event: any) => {
        const files: FileList = event.target.files;
        if (files && files.length > 0) {
          const file: File = files[0];
          const reader: FileReader = new FileReader();
          reader.onload = (e) => {
            const imageDataURL: string = e.target!.result as string;
            this.uploadedImages[index] = imageDataURL;
            const deletedIndex = this.deletedImages.indexOf(imageDataURL);
            if (deletedIndex !== -1) {
              this.deletedImages.splice(deletedIndex, 1);
            }
          };
          reader.readAsDataURL(file);
        }
      });
      fileInput.click();
    }
  
    reUploadDeleted(index: number) {
      if (index > -1 && index < this.deletedImages.length) {
        const imageDataURL = this.deletedImages.splice(index, 1)[0];
        this.uploadedImages.push(imageDataURL);
      }
    }
  
    isPhone(): boolean {
      const screenWidth = window.innerWidth;
      if (screenWidth <= 768) {
        return true;
      } else {
        return false;
      }
    }
  
    isLinear(): boolean {
      return !this.isPhone();
    }
  
    selectOption(category: Category): void {
      this.selectedOption = category;
      this.formData.category_id = category.id; // Update formData with selected category ID
      this.fieldErrors.category = false; // Clear category error when category is selected
      this.optionsVisible = false;    }
  
    onSubmit(): void {
      const accessToken = localStorage.getItem('loggedInUserToken');
      const userId = localStorage.getItem('loggedInUserId');
      let isValid = true;
      // Vérifier si les champs "Ville" et "Code postal" sont remplis
    if (!this.formData.ville) {
      this.fieldErrors.ville = true;
      isValid = false;
  } else {
      this.fieldErrors.ville = false;
  }

  if (!this.formData.code_postal) {
      this.fieldErrors.code_postal = true;
      isValid = false;
  } else {
      this.fieldErrors.code_postal = false;
  }

      if (!accessToken) {
        console.error('Access token not found in local storage.');
        return;
      }
    
      const mediaIds: string[] = []; // Créer une liste pour stocker les IDs des médias
    
      // Utiliser Promise.all pour attendre que toutes les opérations d'upload de média soient terminées
      Promise.all(this.selectedFiles.map(file => {
        return this.annonceService.uploadFile(file, accessToken).then(response => {
          // Ajouter l'ID du média à la liste
          mediaIds.push(response.data.id);
          console.log('File uploaded successfully:', response);
        }).catch(error => {
          console.error('Error uploading file:', error);
          throw error; // Pour transmettre l'erreur à Promise.all
        });
      })).then(() => {
        // Une fois que tous les médias sont téléchargés, créer l'annonce avec les IDs des médias

        console.log('ttt',mediaIds)

            const annonceData = {
          user_id: userId,
          category_id: this.selectedOption.id,
          title: this.formData.titre,
          description: this.formData.description,
          state: this.formData.state,
          urgent: this.formData.urgent,
          highlighted: this.formData.highlighted,
          price: parseFloat(this.formData.prix),
          city: this.formData.ville,
          postal_code: this.formData.code_postal,
          medias: {
            "_ids": mediaIds // Utiliser la liste des IDs des médias
          },
          validation_status: 'pending'
        };
    
        // Créer l'annonce avec les données
        this.annonceService.createAnnonce(annonceData, accessToken!)
          .subscribe(
            response => {
              const addressTabLink = document.querySelector('#address-tab') as HTMLAnchorElement;

              // Click on the address tab link
              if (addressTabLink) {
                  addressTabLink.click();
              }
              console.log('Annonce créée avec succès !', response);
            },
            error => {
              console.error('Erreur lors de la création de l\'annonce :', error);
            }
          );
        // Vider le tableau des fichiers sélectionnés après le téléchargement
        this.selectedFiles = [];
      });
    }

    
    toggleOptions(): void {
      this.optionsVisible = !this.optionsVisible;
    }
  
    toggleUrgent(checked: boolean) {
      this.formData.urgent = checked;
      console.log('urgent',checked,this.formData.urgent);
    }
    
    toggleHighlighted(checked: boolean) {
      this.formData.highlighted = checked;
      console.log('highlighted',checked,this.formData.highlighted);
    }
  
    logout(): void {
      this.authService.logout();
    }

    fieldErrors: {
      [key: string]: boolean;
      titre: boolean;
      description: boolean;
      prix: boolean;
      state: boolean;
      category: boolean; // Add category field,
      ville:boolean;
      code_postal:boolean
    } = {
      titre: false,
      description: false,
      prix: false,
      state: false,
      category: false,
      ville:false ,
      code_postal:false// Initialize category field error to false
    };
    
    clearError(fieldName: string): void {
      this.fieldErrors[fieldName] = false;
    }


    emitNextCallback(): boolean {
      // Assurez-vous que uploadedImages contient les chemins des images à télécharger
      let isValid = true;
      
      // Vérifier si les champs requis sont vides
      if (!this.formData.titre) {
          this.fieldErrors.titre = true;
          isValid = false;
      } else {
          this.fieldErrors.titre = false;
      }
  
      if (!this.formData.description) {
          this.fieldErrors.description = true;
          isValid = false;
      } else {
          this.fieldErrors.description = false;
      }
  
      if (!this.formData.prix) {
          this.fieldErrors.prix = true;
          isValid = false;
      } else {
          this.fieldErrors.prix = false;
      }
  
      if (!this.formData.state) {
          this.fieldErrors.state = true;
          isValid = false;
      } else {
          this.fieldErrors.state = false;
      }
  
      if (!this.formData.category_id) {
          this.fieldErrors.category = true;
          return false; // Arrêter la soumission du formulaire si la catégorie n'est pas sélectionnée
      }
  
      // Si un champ requis est vide, arrêter le processus
      if (!isValid) {
          return false;
      }
  
      // Si tous les champs sont remplis, permettre le passage à l'étape suivante
      return true;
  }
    @Output() nextCallback: EventEmitter<any> = new EventEmitter();

  // Function to convert data URI to Blob
  dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }
    



  onSaveImagesToDatabase(): void {
    this.uploadFiles();
  }
}

