import React from 'react';
import '../styles/TeamPage.css';
import member1Image from '../assets/Humphrey Picture.jpg';
import member2Image from '../assets/Robert Picture.jpg';
import member3Image from '../assets/Joseph Picture.jpg';
import member4Image from '../assets/Charlington Picture.jpg';

const TeamPage = () => {
  // Sample team data - you can replace with your actual team information
  const teamMembers = [
    {
      id: 1,
      name: 'Humphrey Amoakohene',
      role: 'Frontend Developer & UI/UX Designer',
      imageUrl: member1Image
    },
    {
      id: 2,
      name: 'Robert Jarman',
      role: 'DevOps Engineer & Project Manager',
      imageUrl: member2Image
    },
    {
      id: 3,
      name: 'Joseph Ukpong',
      role: 'Backend Engineer & Computational Linguist',
      imageUrl: member3Image
    },
    {
      id: 4,
      name: 'Charlington Coulanges',
      role: 'Backend Developer & Integration Specialist',
      imageUrl: member4Image
    }
  ];

  return (
    <div className="team-page">
      <div className="team-container">
        <h2 className="team-title">Meet Our Team</h2>
        <div className="team-members">
          {teamMembers.map((member) => (
            <div key={member.id} className="team-member">
              <div className="member-image-container">
                <img 
                  src={member.imageUrl} 
                  alt={`${member.name}`} 
                  className="member-image"
                />
              </div>
              <div className="member-info">
                <h3 className="member-name">{member.name}</h3>
                <p className="member-role">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamPage;