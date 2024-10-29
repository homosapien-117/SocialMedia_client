export interface Comment {
  _id: string;
  text: string;
  username: string;
  createdAt: string;
}


export interface Postinterface {
  _id: string;
  desc: string;
  img?: string[];
  createdAt: string;
  userId: any;
  likes: string[];
  authorName: string;
  authorProfilePicture: string;
  comments: Comment[];
  blocked:boolean
}


export interface AnchorEl {
  element: HTMLElement;
  postId: string;
  username: string;
}


export interface AuthContextType {
  token: string;
  userdata: {
    _id: string;
    name: string;
    username: string;
    profilePicture: string;
  };
}

 export interface AddPostProps {
    onPostAdded: () => void;
  }

