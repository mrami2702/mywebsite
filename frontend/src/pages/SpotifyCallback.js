import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const CallbackContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 2rem;
`;

const LoadingSpinner = styled(motion.div)`
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const Message = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
`;

const ErrorMessage = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 2rem;
  max-width: 500px;
`;

const SpotifyCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('connecting');
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          setStatus('error');
          setError(`Spotify authorization failed: ${error}`);
          return;
        }

        if (!code) {
          setStatus('error');
          setError('No authorization code received from Spotify');
          return;
        }

        setStatus('exchanging');
        
        // Call backend to exchange code for tokens
        const response = await fetch(`/api/spotify/frontend-callback?code=${code}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to complete Spotify connection');
        }

        const data = await response.json();
        setStatus('success');
        
        // Redirect to music page after successful connection
        setTimeout(() => {
          navigate('/music', { 
            state: { 
              spotifyConnected: true, 
              profile: data.profile 
            } 
          });
        }, 2000);

      } catch (err) {
        console.error('Spotify callback error:', err);
        setStatus('error');
        setError(err.message || 'Failed to connect to Spotify');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  const renderContent = () => {
    switch (status) {
      case 'connecting':
        return (
          <>
            <LoadingSpinner animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
            <Title>Connecting to Spotify...</Title>
            <Message>Please wait while we complete your authorization</Message>
          </>
        );

      case 'exchanging':
        return (
          <>
            <LoadingSpinner animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
            <Title>Completing Connection...</Title>
            <Message>Exchanging authorization code for access tokens</Message>
          </>
        );

      case 'success':
        return (
          <>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <Title>Spotify Connected!</Title>
            <Message>Successfully connected to your Spotify account</Message>
            <Message>Redirecting to music page...</Message>
          </>
        );

      case 'error':
        return (
          <>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
            <Title>Connection Failed</Title>
            <Message>There was an error connecting to Spotify</Message>
            <ErrorMessage>
              <strong>Error:</strong> {error}
            </ErrorMessage>
            <button 
              onClick={() => navigate('/music')}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                padding: '12px 24px',
                color: 'white',
                cursor: 'pointer',
                marginTop: '1rem'
              }}
            >
              Go to Music Page
            </button>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <CallbackContainer>
      {renderContent()}
    </CallbackContainer>
  );
};

export default SpotifyCallback; 