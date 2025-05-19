'use client'

import React, { useEffect, useState } from 'react'
import NewDocumentButton from './NewDocumentButton'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { MenuIcon } from 'lucide-react'
import { useCollection } from "react-firebase-hooks/firestore"
import { useUser } from '@clerk/nextjs'
import { collectionGroup, DocumentData, query, where } from 'firebase/firestore'
import { db } from '../../firebase'
import SidebarOption from './SidebarOption'
  
// interface correspondant aux documents de la collection 'rooms'
interface RoomDocument extends DocumentData {
    createdAt: string;
    role: "owner" | "editor";
    roomId: string;
    userId: string;
}

function Sidebar() {

    const {user} = useUser()
    const [data, loading, error] = useCollection(
        user && (
            // cherche dans toutes les sous-collections nommées 'rooms' de toute la base Firestore et filtre les documents où userId est égal au premier email de l'utilisateur (converti en string)
            query(collectionGroup(db, 'rooms'), where('userId', '==', user.emailAddresses[0].toString()))
        )
    )

    const [groupedData, setGroupedData] = useState<{
        owner: RoomDocument[];
        editor: RoomDocument[];
    }>({
        owner: [],
        editor: [],
    })

    useEffect(() => {
        if (!data) return

        // Permet de trier les documents en fonction de leur role
        // [doc1, doc2, doc3] => { owner: [doc1], editor: [doc2, doc3] }
        const grouped = data.docs.reduce<{
            owner: RoomDocument[];
            editor: RoomDocument[];
        }>(
            // acc correspond a l'accumulateur de la boucle 
            // curr correspond au document en cours de traitement
            (acc, curr) => {
                const roomData = curr.data() as RoomDocument;

                console.log(curr.id);
                if (roomData.role === "owner") {
                    acc.owner.push({
                        id: curr.id,
                        ...roomData,
                    });
                } else {
                    acc.editor.push({
                        id: curr.id,
                        ...roomData,
                    });
                }

                return acc;
            }, { // second argument : valeur initiale de l'accumulateur
                owner: [],
                editor: [],
            }
        )

        setGroupedData(grouped)

    }, [data])

    const menuOptions = (
        <>
            <NewDocumentButton />
            
        <div className="flex py-4 flex-col space-y-4 md:max-w-36">
           {/* My documents */}
           {groupedData.owner.length === 0 ? (
               <h2 className='text-gray-500 font-semibold text-sm'>
                   No documents found
               </h2>
           ): (
               <>
                   <h2 className='text-gray-500 font-semibold text-sm'>
                       My documents
                   </h2>
                   {groupedData.owner.map((doc) => (
                       <SidebarOption key={doc.id} href={`/document/${doc.id}`} id={doc.id} />
                   ))}
               </>
           )}
           {/* List my documents */} 
        </div>
           {/* The shared documents */} 
           {/* List documents shared with me */} 
        </>
    )

  return (
    <div className='p-2 md:p-5 bg-gray-200 relative'>
        <div className='md:hidden'>
            <Sheet>
                <SheetTrigger>
                    <MenuIcon className='p-2 md:p-5 rounded-lg' size={40} />
                </SheetTrigger>
                <SheetContent side="left">
                    <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>

                    <div>{menuOptions}</div>
                    
                    </SheetHeader>
                </SheetContent>
            </Sheet>
        </div>

        {/* Ce bouton sera donc masqué sur les petits écrans */}
        <div className='hidden md:inline'>
            {menuOptions}
        </div>
    </div>
  )
}

export default Sidebar
