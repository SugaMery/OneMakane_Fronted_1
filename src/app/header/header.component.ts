import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CategoryService } from '../category.service';
import { UserService } from '../user.service';
import { AuthGuard } from '../auth.guard';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  loggedInUserName: string ="Account";
  categories: any[] = [];
  Souscategories: any[] = [];
  showMore: boolean = false;
  constructor(private categoryService: CategoryService,private router: Router,
    private userService: UserService,private authGuard: AuthGuard) { }

    selectAddressTab() {
      const accountLink = document.querySelector('[href="/page-account"]') as HTMLAnchorElement;
      if (accountLink) {
          // Add event listener for the 'load' event to ensure the page has loaded
          window.addEventListener('load', () => {
              // Trigger a click on the account link
              accountLink.click();
  
              // Wait for a brief moment for the page to load and then select the address tab
              setTimeout(() => {
                  const addressTabLink = document.querySelector('#address-tab') as HTMLAnchorElement;
                  if (addressTabLink) {
                      addressTabLink.click();
                  }
              }, 100); // Adjust the timeout as needed
          });
      } 
  }
  
  ngOnInit(): void {
    
      if (typeof localStorage !== 'undefined') {
        // Retrieve the logged-in user's ID and token from localStorage
        const userId = localStorage.getItem('loggedInUserId');
        const accessToken = localStorage.getItem('loggedInUserToken');
        if (userId && accessToken) {
          // Assuming you're inside some method of the User Service class
          // Setting status based on response
          this.userService.getUserInfoById(Number(userId), accessToken).subscribe(userInfo => {
            // Assuming userInfo contains data indicating whether the request was successful or not
            if (userInfo.data) {
                this.status = true;
                this.loggedInUserName = `${userInfo.data.first_name} ${userInfo.data.last_name}`;
            } else {
                this.status = false;
            }
          });

        }
      }
    this.getCategories();
  }
  i!: number ;
  status: boolean = false;
  logout(): void {
    this.status= false;
    this.authGuard.logout();
  }
  getCategories(): void {
    this.categoryService.getCategories()
      .subscribe(categories => {
        this.categories = categories.filter(category => category.status === 'ACTIVE' && category.parent_id === null);
      });
  }

  toggleMoreCategories(): void {
    this.showMore = !this.showMore;
    const moreSlideOpen = document.querySelector('.more_slide_open') as HTMLElement;
    if (moreSlideOpen) {
      moreSlideOpen.style.display = this.showMore ? 'block' : 'none';
    }
  }
  
}
