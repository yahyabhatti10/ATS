'use client'

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Pencil, Trash2, ChevronLeft } from 'lucide-react'

// Define an interface for Admin
interface Admin {
  id: string;
  username: string;
  lastEdited?: string; // lastEdited might be undefined, so we mark it as optional
  createdAt: string;
}

// Fetch API helper functions
async function fetchAdmins(navigate: Function): Promise<Admin[]> {
    const accessToken = localStorage.getItem('access_token'); // Get token
    if (!accessToken) {
        console.error('No access token found');
        navigate('/login-admin'); // Redirect to login if no token
        return []; // Return an empty array or handle this case as needed
    }

    const response = await fetch('http://127.0.0.1:8000/api/v1/all-admins', {
        headers: { 
            'Authorization': `Bearer ${accessToken}`, // Pass the access token in Authorization header
            'Content-Type': 'application/json',
        },
    });

    // Check for non-OK status
    if (!response.ok) {
        const text = await response.text(); // Read the text to check for error
        console.error("Error fetching admins:", text);
        throw new Error(`Failed to fetch admins: ${response.statusText}`);
    }

    return await response.json();
}

async function createAdmin(adminData: { username: string; password: string }, navigate: Function): Promise<Admin> {
    const accessToken = localStorage.getItem('access_token'); // Get token
    if (!accessToken) {
        console.error('No access token found');
        navigate('/login-admin'); // Redirect to login if no token
    }

    const response = await fetch('http://127.0.0.1:8000/api/v1/create-admin', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`, // Pass the access token in Authorization header
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminData),
    });

    if (!response.ok) throw new Error("Failed to create admin");
    return response.json();
}

async function updateAdmin(adminId: string, adminData: { username: string; password: string }, navigate: Function): Promise<Admin> {
    const accessToken = localStorage.getItem('access_token'); // Get token
    if (!accessToken) {
        console.error('No access token found');
        navigate('/login-admin'); // Redirect to login if no token
    }

    const response = await fetch(`http://127.0.0.1:8000/api/v1/update-admin/${adminId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`, // Pass the access token in Authorization header
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminData),
    });

    if (!response.ok) throw new Error("Failed to update admin");
    return response.json();
}

async function deleteAdmin(adminId: string, navigate: Function): Promise<void> {
    const accessToken = localStorage.getItem('access_token'); // Get token
    if (!accessToken) {
        console.error('No access token found');
        navigate('/login-admin'); // Redirect to login if no token
        return; // Handle this case as needed
    }

    const response = await fetch(`http://127.0.0.1:8000/api/v1/delete-admin/${adminId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`, // Pass the access token in Authorization header
        },
    });

    if (!response.ok) throw new Error("Failed to delete admin");
}

// Main Admin Panel component
export default function AdminPanel() {
    const navigate = useNavigate(); // Get navigate function
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null); // Allow null for initial state
    const [editForm, setEditForm] = useState({ username: '', password: '', retypePassword: '' });
    const [newAdminForm, setNewAdminForm] = useState({ username: '', password: '', retypePassword: '' });

    // Fetch admins on component mount
    useEffect(() => {
        fetchAdmins(navigate).then(setAdmins).catch(console.error);
    }, [navigate]); // Add navigate as a dependency

    // Handle delete admin
    const handleDelete = (admin: Admin) => {
        setSelectedAdmin(admin);
        setIsDeleteDialogOpen(true);
    }

    const confirmDelete = async () => {
        if (!selectedAdmin) return; // Null check for selectedAdmin
        try {
            await deleteAdmin(selectedAdmin.id, navigate); // Pass navigate to deleteAdmin
            setAdmins(admins.filter(a => a.id !== selectedAdmin.id));
            setIsDeleteDialogOpen(false);
        } catch (err) {
            console.error(err);
        }
    }

    // Handle edit admin
    const handleEdit = (admin: Admin) => {
        setSelectedAdmin(admin);
        setEditForm({ username: admin.username, password: '', retypePassword: '' });
        setIsEditDialogOpen(true);
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editForm.password !== editForm.retypePassword) {
            alert("Passwords don't match");
            return;
        }
        if (!selectedAdmin) return; // Null check for selectedAdmin
        try {
            const updatedAdmin = await updateAdmin(selectedAdmin.id, { username: editForm.username, password: editForm.password }, navigate); // Pass navigate to updateAdmin
            setAdmins(admins.map(a => a.id === selectedAdmin.id ? updatedAdmin : a));
            setIsEditDialogOpen(false);
        } catch (err) {
            console.error(err);
        }
    }

    // Handle create admin
    const handleCreateAdmin = () => {
        setNewAdminForm({ username: '', password: '', retypePassword: '' });
        setIsCreateDialogOpen(true);
    }

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newAdminForm.password !== newAdminForm.retypePassword) {
            alert("Passwords don't match");
            return;
        }
        try {
            const newAdmin = await createAdmin({ username: newAdminForm.username, password: newAdminForm.password }, navigate); // Pass navigate to createAdmin
            setAdmins([...admins, newAdmin]);
            setIsCreateDialogOpen(false);
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className="min-h-screen bg-white text-black p-8">
            <Button variant="outline" className="bg-black text-white hover:bg-gray-800">
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
            <div className="flex justify-between mb-6">
                <Button className="bg-green-500 text-white hover:bg-green-600" onClick={handleCreateAdmin}>
                    Add Admin
                </Button>
            </div>
            <table className="min-w-full table-auto">
                <thead>
                    <tr>
                        <th className="px-4 py-2">Admin ID</th>
                        <th className="px-4 py-2">Admin Username</th>
                        <th className="px-4 py-2">Last Edited</th>
                        <th className="px-4 py-2">Created At</th>
                        <th className="px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {admins.map((admin) => (
                        <tr key={admin.id}>
                            <td className="border px-4 py-2">{admin.id}</td>
                            <td className="border px-4 py-2">{admin.username}</td>
                            <td className="border px-4 py-2">{admin.lastEdited || 'N/A'}</td>
                            <td className="border px-4 py-2">{admin.createdAt}</td>
                            <td className="border px-4 py-2">
                                <Button onClick={() => handleEdit(admin)} className="mr-2">Edit</Button>
                                <Button onClick={() => handleDelete(admin)} className="bg-red-500 text-white">Delete</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this admin?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                        <Button onClick={confirmDelete} className="bg-red-500 text-white">Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Admin Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Admin</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit}>
                        <Input
                            required
                            placeholder="Username"
                            value={editForm.username}
                            onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                        />
                        <Input
                            required
                            placeholder="Password"
                            type="password"
                            value={editForm.password}
                            onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                        />
                        <Input
                            required
                            placeholder="Retype Password"
                            type="password"
                            value={editForm.retypePassword}
                            onChange={(e) => setEditForm({ ...editForm, retypePassword: e.target.value })}
                        />
                        <DialogFooter>
                            <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Create Admin Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Admin</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit}>
                        <Input
                            required
                            placeholder="Username"
                            value={newAdminForm.username}
                            onChange={(e) => setNewAdminForm({ ...newAdminForm, username: e.target.value })}
                        />
                        <Input
                            required
                            placeholder="Password"
                            type="password"
                            value={newAdminForm.password}
                            onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                        />
                        <Input
                            required
                            placeholder="Retype Password"
                            type="password"
                            value={newAdminForm.retypePassword}
                            onChange={(e) => setNewAdminForm({ ...newAdminForm, retypePassword: e.target.value })}
                        />
                        <DialogFooter>
                            <Button onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">Create</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
