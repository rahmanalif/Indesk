import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Search, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Card, CardContent } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { useCreateClinicalNoteMutation, useGetClientByIdQuery } from '../../redux/api/clientsApi';

export function ClientNotesPage() {
    const { id } = useParams();
    const { data: clientData, isLoading, isError, error } = useGetClientByIdQuery(id ?? '', {
        skip: !id
    });
    const [isAdding, setIsAdding] = useState(false);
    const [newNoteContent, setNewNoteContent] = useState('');
    const [createClinicalNote, { isLoading: isCreating, error: createError }] = useCreateClinicalNoteMutation();

    const notes = useMemo(() => {
        const rawNotes = clientData?.response?.data?.notes || [];
        return [...rawNotes].sort((a, b) => {
            const aTime = new Date(a.createdAt).getTime();
            const bTime = new Date(b.createdAt).getTime();
            return bTime - aTime;
        });
    }, [clientData]);

    const handleAddNote = async () => {
        if (!newNoteContent.trim()) return;
        if (!id) return;

        try {
            await createClinicalNote({
                clientId: id,
                note: newNoteContent.trim()
            }).unwrap();
            setNewNoteContent('');
            setIsAdding(false);
        } catch (err) {
            console.error('Failed to create clinical note:', err);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading notes...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center text-red-600">
                    <p>Error loading notes: {(error as any)?.data?.message || 'Unknown error'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search notes..." className="pl-10 h-11" />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button onClick={() => setIsAdding(!isAdding)} className="w-full sm:w-auto h-11">
                        <Plus className="mr-2 h-4 w-4" />
                        New Note
                    </Button>
                </div>
            </div>

            {/* Add Note Area */}
            {isAdding && (
                <Card className="border-2 border-primary/20 bg-primary/5">
                    <CardContent className="pt-6 space-y-4">
                        <h3 className="font-semibold text-primary">New Clinical Note</h3>
                        <Textarea
                            className="min-h-[150px] bg-white"
                            placeholder="Write your clinical observations here..."
                            value={newNoteContent}
                            onChange={(e) => setNewNoteContent(e.target.value)}
                            autoFocus
                        />
                        {createError ? (
                            <div className="text-sm text-red-600">
                                {(createError as any)?.data?.message || 'Failed to create note.'}
                            </div>
                        ) : null}
                        <div className="flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                            <Button onClick={handleAddNote} isLoading={isCreating} disabled={isCreating}>
                                Save Note
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Notes Timeline List */}
            <div className="space-y-6">
                {notes.length === 0 && !isAdding && (
                    <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                        No notes found. Click "Add New Note" to start.
                    </div>
                )}

                {notes.map((note) => (
                    <div key={note.id} className="flex gap-0 sm:gap-4 group">
                        {/* Timeline Node */}
                        <div className="hidden sm:flex flex-col items-center">
                            <div className="w-px h-6 bg-border/60 group-first:bg-transparent"></div>
                            <div className="h-3 w-3 rounded-full bg-primary ring-4 ring-white"></div>
                            <div className="w-px h-full bg-border/60 group-last:bg-transparent min-h-[50px]"></div>
                        </div>

                        <Card className="flex-1 mb-2 hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar fallback="CN" className="h-8 w-8 text-xs" />
                                        <div>
                                            <p className="font-semibold text-sm">Clinician</p>
                                            <p className="text-xs text-muted-foreground">Clinician</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="font-normal text-muted-foreground">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </Badge>
                                        <Badge variant="secondary">Clinical</Badge>
                                    </div>
                                </div>
                                <div className="pl-0 sm:pl-11">
                                    <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                                        {note.note}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
}
