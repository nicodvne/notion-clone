'use client'

import { Button } from './ui/button'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createNewDocument } from '../../actions/actions'

function NewDocumentButton() {

  // useTransition permet de différer les mises à jour non urgentes (ex : filtrage lourd) 
  // pour que les interactions utilisateur restent fluides (ex : saisie dans un champ).
  // isPending : booléen, vaut true tant que la mise à jour est en cours.
 //startTransition : une fonction qui prend une fonction de mise à jour, que React peut exécuter de manière dépriorisée.

  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleCreateNewDocument = () => {
    startTransition(async () => {
      // code de mise à jour non urgent
      const {docId} = await createNewDocument();
      router.push(`/doc/${docId}`);
    })
    console.log('create new document')
  }

  return (
    <Button onClick={handleCreateNewDocument} disabled={isPending}>
      {isPending ? 'Creating...' : 'New Document'}
    </Button>
  )
}

export default NewDocumentButton
