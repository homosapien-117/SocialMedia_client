import React from 'react';
import './loading.css';

interface LoadingScreenProps {
  loading: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ loading }) => {
  return loading ? <div className="loader"></div> : null;
};

export default LoadingScreen;
