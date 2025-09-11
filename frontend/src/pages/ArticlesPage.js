import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiFileText } from 'react-icons/fi';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
`;

const ComingSoonCard = styled(motion.div)`
  background: white;
  padding: 4rem 2rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin: 4rem auto;
  max-width: 600px;
`;

const Icon = styled.div`
  font-size: 4rem;
  color: #F7931E;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #4A4238;
  margin-bottom: 1rem;
`;

const Message = styled.p`
  font-size: 1.2rem;
  color: #8B7765;
  line-height: 1.6;
`;

const ArticlesPage = () => {
  return (
    <PageContainer>
      <ComingSoonCard
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Icon>📝</Icon>
        <Title>Articles & Blog</Title>
        <Message>
          Coming Soon! This section will feature my thoughts on technology, 
          fitness insights, and personal reflections. Stay tuned for engaging content!
        </Message>
      </ComingSoonCard>
    </PageContainer>
  );
};

export default ArticlesPage; 