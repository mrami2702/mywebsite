import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiMail, FiMapPin, FiGithub, FiLinkedin, FiCode, FiActivity, FiHeart } from 'react-icons/fi';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Section = styled.section`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #6B4E71;
  margin-bottom: 1.5rem;
  text-align: left;
  font-family: 'Lato', sans-serif;
  font-weight: 700;
`;

const ContentCard = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const ProfileImage = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 20px rgba(155, 107, 158, 0.3);
  overflow: hidden;
  background: #f0f0f0;
`;

const ProfileImageImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
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

const Bio = styled.p`
  color: #8B7B8B;
  line-height: 1.8;
  font-size: 1.1rem;
  text-align: center;
  max-width: 800px;
  margin: 0 auto 2rem;
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

const SkillsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const SkillCard = styled.div`
  background: linear-gradient(135deg, rgba(248, 246, 255, 0.95) 0%, rgba(240, 237, 245, 0.9) 100%);
  padding: 2rem;
  border-radius: 20px;
  border-left: 6px solid #9B6B9E;
  box-shadow: 
    0 8px 32px rgba(155, 107, 158, 0.15),
    0 4px 16px rgba(155, 107, 158, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(155, 107, 158, 0.1);
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 
      0 12px 40px rgba(155, 107, 158, 0.2),
      0 6px 20px rgba(155, 107, 158, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(155, 107, 158, 0.05) 0%, transparent 50%);
    border-radius: 20px;
    pointer-events: none;
  }
`;

const SkillTitle = styled.h4`
  color: #6B4E71;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  font-family: 'Lato', sans-serif;
  font-weight: 700;
  position: relative;
  z-index: 1;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 30px;
    height: 2px;
    background: linear-gradient(90deg, #9B6B9E, #B8A9C9);
    border-radius: 1px;
  }
`;

const SkillList = styled.ul`
  color: #8B7B8B;
  list-style: none;
  padding: 0;
  position: relative;
  z-index: 1;
`;

const SkillItem = styled.li`
  padding: 0.5rem 0;
  position: relative;
  padding-left: 1.5rem;
  
  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 8px;
    height: 8px;
    background: linear-gradient(135deg, #D4AF37, #F4D03F);
    border-radius: 50%;
    box-shadow: 
      0 2px 4px rgba(212, 175, 55, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.8);
  }
  
  &:hover {
    color: #6B4E71;
    transform: translateX(4px);
    transition: all 0.2s ease;
  }
`;

const ContactInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  margin-top: 2rem;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #8B7B8B;
  font-size: 1rem;
`;

const ContactLink = styled.a`
  color: #9B6B9E;
  text-decoration: none;
  transition: color 0.3s ease;
  
  &:hover {
    color: #6B4E71;
  }
`;

const AboutPage = () => {
  return (
    <PageContainer>
      <Section>
        <SectionTitle>About Me</SectionTitle>
        
        <ContentCard
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <ProfileImage>
            <ProfileImageImg src="/headshot.jpg" alt="Maya A. Ramirez" />
          </ProfileImage>
          
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
        
        <Bio>
            I am passionate about health, wellness, and the integration of technology 
            to enhance lives and promote human creativity. Based in Austin, TX, I combine 
            my knowledge in Python development, Generative AI, and AI Agents with my love for fitness 
            and endurance training.
          </Bio>
          
          <ContactInfo>
            <ContactItem>
              <FiMail />
              <ContactLink href="mailto:mrami2702@gmail.com">
                mrami2702@gmail.com
              </ContactLink>
            </ContactItem>
            
            <ContactItem>
              <FiMapPin />
              <span>Austin, TX</span>
            </ContactItem>
            
            <ContactItem>
              <FiGithub />
              <ContactLink href="https://github.com/mrami2702" target="_blank">
                github.com/mrami2702
              </ContactLink>
            </ContactItem>
            
            <ContactItem>
              <FiLinkedin />
              <ContactLink href="https://linkedin.com/in/maya-ramirez-367066184" target="_blank">
                linkedin.com/in/maya-ramirez-367066184
              </ContactLink>
            </ContactItem>
          </ContactInfo>
        </ContentCard>
      </Section>

      <Section>
        <SectionTitle>Quick Overview</SectionTitle>
        <FeaturedGrid>
          <FeaturedCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -2 }}
          >
            <CardIcon></CardIcon>
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
            <CardIcon></CardIcon>
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
            <CardIcon></CardIcon>
            <CardTitle>Health and Wellness</CardTitle>
            <CardDescription>
              Mental health, Healthy food thoughts, Free living
            </CardDescription>
          </FeaturedCard>
        </FeaturedGrid>
      </Section>

      <Section>
        <SectionTitle>Skills & Expertise</SectionTitle>
        
        <SkillsGrid>
          <SkillCard
            initial={{ opacity: 0, y: 20, rotateX: -10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.8, delay: 0.1, type: "spring", stiffness: 100 }}
            whileHover={{ 
              y: -8, 
              rotateX: 2,
              transition: { duration: 0.3 }
            }}
          >
            <SkillTitle>Professional Skills</SkillTitle>
            <SkillList>
              <SkillItem>Python Development</SkillItem>
              <SkillItem>AI Agents & Machine Learning</SkillItem>
              <SkillItem>Generative AI & LLMs</SkillItem>
              <SkillItem>API Development & Integration</SkillItem>
              <SkillItem>Database Design & Management</SkillItem>
            </SkillList>
          </SkillCard>

          <SkillCard
            initial={{ opacity: 0, y: 20, rotateX: -10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 100 }}
            whileHover={{ 
              y: -8, 
              rotateX: 2,
              transition: { duration: 0.3 }
            }}
          >
            <SkillTitle>Fitness & Training</SkillTitle>
            <SkillList>
              <SkillItem>Hybrid Training </SkillItem>
              <SkillItem>HYROX Training</SkillItem>
              <SkillItem>Endurance & Strength Training</SkillItem>
              <SkillItem>Race Strategy & Preparation</SkillItem>
              <SkillItem>Recovery & Nutrition</SkillItem>
            </SkillList>
          </SkillCard>

          <SkillCard
            initial={{ opacity: 0, y: 20, rotateX: -10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.8, delay: 0.3, type: "spring", stiffness: 100 }}
            whileHover={{ 
              y: -8, 
              rotateX: 2,
              transition: { duration: 0.3 }
            }}
          >
            <SkillTitle>Personal Interests</SkillTitle>
            <SkillList>
              <SkillItem>Music Discovery & Curation</SkillItem>
              <SkillItem>Books & Scientific Literature</SkillItem>
              <SkillItem>Community Building</SkillItem>
              <SkillItem>Continuous Learning</SkillItem>
            </SkillList>
          </SkillCard>
        </SkillsGrid>
      </Section>
    </PageContainer>
  );
};

export default AboutPage; 



