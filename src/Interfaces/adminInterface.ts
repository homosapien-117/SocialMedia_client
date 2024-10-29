import { Postinterface } from "../Interfaces/postInterface";
import { User } from "../Interfaces/profileInterface";
export interface LoginValues {
    email: string;
    password: string;
  }
  
 export interface AdminLoginResponse {
    message: string;
    token: string;
    user: any; 
  }

  
export interface FormValues {
    email: string;
    password: string;
  }
  export interface Report {
    report: {
      reason: string;
      reportedDatetime: string;
    };
    _id: string;
    post: Postinterface;
    reportedUser: User;
    postOwner: User;
  }