import { createNewDocument } from "../actions"
import { auth } from "@clerk/nextjs/server"
import { adminDb } from "../../firebase-admin"



// ----------------------------------------------------
// mockReturnValue
// ----------------------------------------------------
// Utilisé pour les fonctions synchrones.
// Définit une valeur de retour immédiate pour le mock.
//
// Exemple :
// const fn = jest.fn();
// fn.mockReturnValue(42);
// fn(); // retourne 42
//
// Utile pour simuler un comportement simple, non-async.

// ----------------------------------------------------
// mockResolvedValue
// ----------------------------------------------------
// Utilisé pour les fonctions asynchrones.
// Simule une promesse résolue avec une valeur donnée.
//
// Exemple :
// const asyncFn = jest.fn();
// asyncFn.mockResolvedValue('OK');
// await asyncFn(); // retourne une promesse résolue avec 'OK'
//
// Idéal pour mocker les appels réseau, accès base de données, etc.

// ----------------------------------------------------
// mockImplementation
// ----------------------------------------------------
// Permet de définir une fonction personnalisée pour le mock.
// Donne un contrôle total sur le comportement du mock.
//
// Exemple :
// const sum = jest.fn();
// sum.mockImplementation((a, b) => a + b);
// sum(2, 3); // retourne 5
//
// Utile quand tu veux simuler une logique plus complexe ou conditionnelle.


// Préciser a jest qu'on veut utiliser le mock au lieu du vrai module pour les tests
jest.mock('@clerk/nextjs/server');
jest.mock('../../firebase-admin');

describe("test create new document", () => {
    const mockCollection = jest.fn();
    const mockAdd = jest.fn();
    const mockSet = jest.fn();
    const mockAuth = auth as unknown as jest.Mock;

    beforeEach(() => {
        // 🔄 Réinitialise tous les mocks avant chaque test
        jest.clearAllMocks();
      
        // 📄 Simule la création d’un document dans la collection 'documents'
        // Dans l'action, la méthode mockAdd retourne un objet (stocké dans docRef). On utilise docRef.id dans le code, donc on doit retourner un id
        mockAdd.mockResolvedValue({ id: 'docId' });
      
        // 🧾 Peu importe le retour de la méthode set, on a juste besoin de vérifier qu'elle sera appelée
        mockSet.mockResolvedValue(undefined);
      
        // 🧱 Simule un document utilisateur avec une sous-collection 'rooms' et une méthode set
        const mockUserDoc = {
          collection: jest.fn().mockReturnValue({
            doc: jest.fn().mockReturnValue({
              set: mockSet
            })
          })
        };
      
        // 🧠 on doit mocker adminDb.collection(name)
        // On retourne des objets différents selon si on veut mocker 'documents' ou 'users'
        mockCollection.mockImplementation((name: string) => {
          if (name === "documents") {
            return { add: mockAdd };
          }
      
          if (name === "users") {
            return { doc: jest.fn().mockReturnValue(mockUserDoc) };
          }
      
          // 💡 Retourne un objet vide par défaut (sécurité)
          return {};
        });
      
        // 🔌 Injecte notre mock dans adminDb
        (adminDb as any).collection = mockCollection;
      
        // 🔐 Simule une session utilisateur retournée par Clerk
        mockAuth.mockResolvedValue({
          sessionClaims: {
            email: 'email@email.com',
          },
        });
      
        // 🛡️ Simule la méthode protect() de Clerk (auth.protect)
        (mockAuth as any).protect = jest.fn();
    });
      
      

    it("should create a new document", async () => {
        const res = await createNewDocument()
        
        expect(auth.protect).toHaveBeenCalled();
        expect(mockAuth).toHaveBeenCalled();
        expect(mockCollection).toHaveBeenCalledWith('documents');

        expect(mockAdd).toHaveBeenCalled();
        expect(mockAdd).toHaveReturned();

        expect(mockSet).toHaveBeenCalledWith({
            userId: "email@email.com",
            role: "owner",
            roomId: "docId",
            createdAt: expect.any(Date),
        })

        expect(res).toEqual({docId: "docId"})
    })

})