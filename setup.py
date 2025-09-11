#!/usr/bin/env python3
"""
Setup script for Maya's Personal Website
This script will help you get the project running quickly.
"""

import os
import sys
import subprocess
import platform

def print_step(step, message):
    """Print a formatted step message"""
    print(f"\n{'='*50}")
    print(f"STEP {step}: {message}")
    print(f"{'='*50}")

def run_command(command, cwd=None):
    """Run a command and return success status"""
    try:
        result = subprocess.run(command, shell=True, cwd=cwd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"❌ Command failed: {command}")
            print(f"Error: {result.stderr}")
            return False
        return True
    except Exception as e:
        print(f"❌ Error running command: {e}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8+ is required")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} detected")
    return True

def check_node_version():
    """Check if Node.js is installed"""
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Node.js {result.stdout.strip()} detected")
            return True
        else:
            print("❌ Node.js not found")
            return False
    except FileNotFoundError:
        print("❌ Node.js not found")
        return False

def setup_backend():
    """Set up the FastAPI backend"""
    print_step(1, "Setting up FastAPI Backend")
    
    if not os.path.exists('backend'):
        print("❌ Backend directory not found")
        return False
    
    # Create virtual environment
    print("Creating Python virtual environment...")
    if not run_command('python -m venv venv', cwd='backend'):
        return False
    
    # Activate virtual environment and install requirements
    if platform.system() == "Windows":
        activate_cmd = "venv\\Scripts\\activate && pip install -r requirements.txt"
    else:
        activate_cmd = "source venv/bin/activate && pip install -r requirements.txt"
    
    print("Installing Python dependencies...")
    if not run_command(activate_cmd, cwd='backend'):
        return False
    
    print("✅ Backend setup complete!")
    return True

def setup_frontend():
    """Set up the React frontend"""
    print_step(2, "Setting up React Frontend")
    
    if not os.path.exists('frontend'):
        print("❌ Frontend directory not found")
        return False
    
    print("Installing Node.js dependencies...")
    if not run_command('npm install', cwd='frontend'):
        return False
    
    print("✅ Frontend setup complete!")
    return True

def create_env_file():
    """Create .env file from example"""
    print_step(3, "Creating Environment File")
    
    backend_env_example = 'backend/env.example'
    backend_env = 'backend/.env'
    
    if os.path.exists(backend_env_example) and not os.path.exists(backend_env):
        try:
            with open(backend_env_example, 'r') as f:
                content = f.read()
            
            with open(backend_env, 'w') as f:
                f.write(content)
            
            print("✅ Created .env file from env.example")
            print("⚠️  Remember to update the .env file with your actual credentials!")
        except Exception as e:
            print(f"❌ Error creating .env file: {e}")
            return False
    else:
        print("✅ .env file already exists or env.example not found")
    
    return True

def print_instructions():
    """Print setup instructions"""
    print_step(4, "Setup Complete!")
    
    print("""
🚀 Your website is ready! Here's how to run it:

BACKEND (FastAPI):
1. Navigate to the backend directory: cd backend
2. Activate virtual environment:
   - Windows: venv\\Scripts\\activate
   - Mac/Linux: source venv/bin/activate
3. Start the server: python main.py
4. Open http://localhost:8000/docs to see the API documentation

FRONTEND (React):
1. Open a new terminal
2. Navigate to the frontend directory: cd frontend
3. Start the development server: npm start
4. Open http://localhost:3000 to see your website

📚 API Documentation:
- Visit http://localhost:8000/docs to see and test all API endpoints
- This is FastAPI's automatic interactive documentation

🔧 Next Steps:
- Customize the content in the React components
- Add your actual data to the database
- Configure your Strava and Spotify API credentials
- Deploy to production when ready

Need help? Check the README.md file for more details!
""")

def main():
    """Main setup function"""
    print("🎉 Welcome to Maya's Personal Website Setup!")
    print("This script will help you get everything running quickly.\n")
    
    # Check prerequisites
    if not check_python_version():
        sys.exit(1)
    
    if not check_node_version():
        print("Please install Node.js from https://nodejs.org/")
        sys.exit(1)
    
    # Run setup steps
    if not setup_backend():
        print("❌ Backend setup failed")
        sys.exit(1)
    
    if not setup_frontend():
        print("❌ Frontend setup failed")
        sys.exit(1)
    
    if not create_env_file():
        print("❌ Environment file creation failed")
        sys.exit(1)
    
    print_instructions()

if __name__ == "__main__":
    main() 