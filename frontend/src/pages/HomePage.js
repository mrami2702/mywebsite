import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiCode, FiActivity, FiHeart } from 'react-icons/fi';
import { FiArrowRight, FiTrendingUp, FiClock, FiMapPin } from 'react-icons/fi';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const HeroSection = styled.section`
  text-align: center;
  padding: 4rem 0;
  margin-bottom: 4rem;
`;

const HeroTitle = styled(motion.h1)`
  font-size: 2.5rem;
  color: #6B4E71;
  margin-bottom: 1rem;
  font-weight: 700;
  font-family: 'Lato', sans-serif;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const HeroSubtitle = styled(motion.div)`
  font-size: 1.25rem;
  color: #8B7B8B;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
`;

const SubtitleItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #9B6B9E;
  font-weight: 500;
`;

const SubtitleIcon = styled.div`
  font-size: 1.1rem;
  color: #9B6B9E;
`;

const HeroImage = styled(motion.div)`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(155, 107, 158, 0.3);
  overflow: hidden;
  background: #f0f0f0;
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
`;

const CTAButton = styled(motion.button)`
  background: #9B6B9E;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(155, 107, 158, 0.3);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(155, 107, 158, 0.4);
    background: #6B4E71;
  }
`;

const FeaturedSection = styled.section`
  margin-bottom: 4rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #6B4E71;
  margin-bottom: 1.5rem;
  text-align: left;
  font-family: 'Lato', sans-serif;
  font-weight: 700;
`;

const FeaturedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const FeaturedCard = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease;
  border: 1px solid #f0f0f0;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }
`;

const CardIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #9B6B9E;
`;

const CardTitle = styled.h3`
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
`;

const CardDescription = styled.p`
  color: #666;
  line-height: 1.5;
  font-size: 0.9rem;
`;

const CardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #8B7B8B;
  font-size: 0.9rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const StatsSection = styled.section`
  background: #f8f9fa;
  padding: 3rem;
  border-radius: 8px;
  margin-bottom: 4rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  text-align: center;
`;

const StatItem = styled(motion.div)`
  padding: 1rem;
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #9B6B9E;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #8B7B8B;
  font-weight: 500;
`;

const HomePage = () => {
  return (
    <PageContainer>
      <HeroSection>
        <HeroImage
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          <ProfileImage src="/headshot.jpg" alt="Maya A. Ramirez" />
        </HeroImage>
        
        <HeroTitle
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Maya A. Ramirez
        </HeroTitle>
        
        <HeroSubtitle
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <SubtitleItem>
            <SubtitleIcon><FiCode /></SubtitleIcon>
            Technology
          </SubtitleItem>
          <SubtitleItem>
            <SubtitleIcon><FiActivity /></SubtitleIcon>
            Fitness
          </SubtitleItem>
          <SubtitleItem>
            <SubtitleIcon><FiHeart /></SubtitleIcon>
            Health & Wellness
          </SubtitleItem>
        </HeroSubtitle>
      </HeroSection>

      <FeaturedSection>
        <SectionTitle>Quick Overview</SectionTitle>
        <FeaturedGrid>
          <FeaturedCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -2 }}
          >
            <CardIcon>💻</CardIcon>
            <CardTitle>Technology</CardTitle>
            <CardDescription>
              Python Backend, AI Agents, Generative AI
            </CardDescription>
          </FeaturedCard>

          <FeaturedCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -2 }}
          >
            <CardIcon>🏃‍♀️</CardIcon>
            <CardTitle>Fitness</CardTitle>
            <CardDescription>
              HYROX Training, Endurance, Strength
            </CardDescription>
          </FeaturedCard>

          <FeaturedCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -2 }}
          >
            <CardIcon>🧘‍♀️</CardIcon>
            <CardTitle>Health and Wellness</CardTitle>
            <CardDescription>
              Mental health, Healthy food thoughts, Free living
            </CardDescription>
          </FeaturedCard>
        </FeaturedGrid>
      </FeaturedSection>

      <StatsSection>
        <SectionTitle>Activity Summary</SectionTitle>
        <StatsGrid>
          <StatItem
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <StatNumber>2</StatNumber>
            <StatLabel>Years in Tech</StatLabel>
          </StatItem>
          
          <StatItem
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <StatNumber>5+</StatNumber>
            <StatLabel>Races Completed</StatLabel>
          </StatItem>
          
          <StatItem
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <StatNumber>100+</StatNumber>
            <StatLabel>Workouts This Year</StatLabel>
          </StatItem>
          
          <StatItem
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <StatNumber>500+</StatNumber>
            <StatLabel>Songs in Library</StatLabel>
          </StatItem>
        </StatsGrid>
      </StatsSection>
    </PageContainer>
  );
};

export default HomePage; 