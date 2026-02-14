# Setting Admin User

This guide explains how to set a user as admin in the StressReliefChat application.

## Prerequisites

1. Make sure you have a `.env` file in the `backend` directory with `MONGODB_URI` configured
2. The user must already exist in the database (they need to have logged in at least once)

## Method 1: Using npm script (Recommended)

From the `backend` directory:

```bash
npm run set-admin user@example.com
```

## Method 2: Using Node directly

From the `backend` directory:

```bash
node set-admin.js user@example.com
```

## Method 3: Using PowerShell (Windows)

From the project root:

```powershell
cd backend
node set-admin.js user@example.com
```

## Method 4: Using Command Prompt (Windows)

From the project root:

```cmd
cd backend
node set-admin.js user@example.com
```

## Examples

```bash
# Set admin for a specific email
npm run set-admin admin@stressrelief.com

# Set admin for another user
npm run set-admin john.doe@example.com
```

## What the script does

1. Connects to MongoDB using the `MONGODB_URI` from your `.env` file
2. Finds the user by email (case-insensitive)
3. Updates their role to `'admin'`
4. Displays a success or error message

## Important Notes

- **The user must exist first**: The user needs to have registered/logged in at least once before you can set them as admin
- **Email is case-insensitive**: The script automatically converts the email to lowercase
- **No user creation**: This script only updates existing users, it doesn't create new ones
- **Database connection**: Make sure your MongoDB is running and accessible

## Troubleshooting

### Error: "No user found with that email"
- The user hasn't logged in/registered yet
- Solution: Have the user log in first, then run the script

### Error: "Could not connect to database"
- Check your `MONGODB_URI` in the `.env` file
- Make sure MongoDB is running
- Verify network connectivity

### Error: "MONGODB_URI not found"
- Make sure you have a `.env` file in the `backend` directory
- Add `MONGODB_URI=your_connection_string` to the `.env` file

## Verifying Admin Status

After running the script, the user should:
1. Log out and log back in
2. See "Admin Dashboard" in their profile menu
3. Be able to access `/admin` route



