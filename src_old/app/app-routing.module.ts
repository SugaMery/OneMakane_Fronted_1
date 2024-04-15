import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { PageAccountComponent } from './page-account/page-account.component';
import { AuthGuard } from './auth.guard';
import { ShopProductFullComponent } from './shop-product-full/shop-product-full.component';

const routes: Routes = [
  { path: '', component: HomePageComponent }, 
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'page-account', component: PageAccountComponent },
  { path: 'shop-product-right', component: ShopProductFullComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
