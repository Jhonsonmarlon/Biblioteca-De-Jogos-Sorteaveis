"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Sparkles, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { motion } from "framer-motion"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import GameList from "./game-list"
import GameDetails from "./game-details"
import GameProgress from "./game-progress"

export type Game = {
  id: string
  name: string
  description: string
  maxPlayers: number
  availableOnHydra: boolean
  imageUrl: string
  addedBy: string
  played: boolean
  createdAt?: number // Timestamp for sorting
}

export default function GameLibrary() {
  const [games, setGames] = useState<Game[]>([])
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [showAddGameModal, setShowAddGameModal] = useState(false)
  const [showEditGameModal, setShowEditGameModal] = useState(false)
  const [showGameDetailsModal, setShowGameDetailsModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [gameToView, setGameToView] = useState<Game | null>(null)
  const [gameToEdit, setGameToEdit] = useState<Game | null>(null)
  const [gameToDelete, setGameToDelete] = useState<Game | null>(null)

  // Form state
  const [newGame, setNewGame] = useState({
    name: "",
    description: "",
    maxPlayers: 4,
    availableOnHydra: false,
    imageUrl: "",
    addedBy: "",
    played: false,
  })

  // Edit form state
  const [editGame, setEditGame] = useState<Game | null>(null)

  // Sort games: unplayed first (newest to oldest), then played (oldest to newest)
  const sortedGames = useMemo(() => {
    return [...games].sort((a, b) => {
      // If one is played and the other isn't, the unplayed one comes first
      if (a.played !== b.played) {
        return a.played ? 1 : -1
      }

      // If both are played or both are unplayed, sort by creation time
      const aTime = a.createdAt || 0
      const bTime = b.createdAt || 0

      // For unplayed games, newest first (descending)
      if (!a.played) {
        return bTime - aTime
      }

      // For played games, oldest first (ascending)
      return aTime - bTime
    })
  }, [games])

  // Load games from localStorage on component mount
  useEffect(() => {
    const savedGames = localStorage.getItem("repingoGames")
    if (savedGames) {
      setGames(JSON.parse(savedGames))
    } else {
      // Add some sample games if no games exist
      const now = Date.now()
      const sampleGames: Game[] = [
        {
          id: "1",
          name: "Minecraft",
          description: "Um jogo de mundo aberto onde você pode construir e explorar.",
          maxPlayers: 8,
          availableOnHydra: true,
          imageUrl: "https://www.minecraft.net/content/dam/games/minecraft/key-art/MCEE_PartnerImage_3840x2160.jpg",
          addedBy: "Pedro",
          played: true,
          createdAt: now - 3000000, // 50 minutes ago
        },
        {
          id: "2",
          name: "Counter-Strike 2",
          description: "FPS tático em equipes de terroristas e contra-terroristas.",
          maxPlayers: 10,
          availableOnHydra: true,
          imageUrl: "https://cdn.akamai.steamstatic.com/steam/apps/730/capsule_616x353.jpg",
          addedBy: "João",
          played: false,
          createdAt: now - 1800000, // 30 minutes ago
        },
        {
          id: "3",
          name: "Stardew Valley",
          description: "Jogo de simulação de fazenda com elementos de RPG.",
          maxPlayers: 4,
          availableOnHydra: false,
          imageUrl: "https://cdn.akamai.steamstatic.com/steam/apps/413150/header.jpg",
          addedBy: "Maria",
          played: false,
          createdAt: now - 600000, // 10 minutes ago
        },
      ]
      setGames(sampleGames)
      localStorage.setItem("repingoGames", JSON.stringify(sampleGames))
    }
  }, [])

  // Save games to localStorage whenever they change
  useEffect(() => {
    if (games.length > 0) {
      localStorage.setItem("repingoGames", JSON.stringify(games))
    }
  }, [games])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewGame({ ...newGame, [name]: value })
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editGame) return
    const { name, value } = e.target
    setEditGame({ ...editGame, [name]: value })
  }

  const handleCheckboxChange = (checked: boolean) => {
    setNewGame({ ...newGame, availableOnHydra: checked })
  }

  const handleEditCheckboxChange = (field: string, checked: boolean) => {
    if (!editGame) return
    setEditGame({ ...editGame, [field]: checked })
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value) || 1
    setNewGame({ ...newGame, maxPlayers: value })
  }

  const handleEditNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editGame) return
    const value = Number.parseInt(e.target.value) || 1
    setEditGame({ ...editGame, maxPlayers: value })
  }

  const handleAddGame = () => {
    if (!newGame.name || !newGame.description || !newGame.addedBy) {
      alert("Por favor, preencha todos os campos obrigatórios!")
      return
    }

    const gameToAdd: Game = {
      id: Date.now().toString(),
      ...newGame,
      createdAt: Date.now(),
    }

    setGames([gameToAdd, ...games])
    setShowAddGameModal(false)
    setNewGame({
      name: "",
      description: "",
      maxPlayers: 4,
      availableOnHydra: false,
      imageUrl: "",
      addedBy: "",
      played: false,
    })
  }

  const handleUpdateGame = () => {
    if (!editGame) return

    if (!editGame.name || !editGame.description || !editGame.addedBy) {
      alert("Por favor, preencha todos os campos obrigatórios!")
      return
    }

    setGames(games.map((game) => (game.id === editGame.id ? editGame : game)))

    // If the updated game is the selected game, update it too
    if (selectedGame && selectedGame.id === editGame.id) {
      setSelectedGame(editGame)
    }

    // If the updated game is being viewed in details, update it too
    if (gameToView && gameToView.id === editGame.id) {
      setGameToView(editGame)
    }

    setShowEditGameModal(false)
    setEditGame(null)
  }

  const handleDeleteGame = () => {
    if (!gameToDelete) return

    const newGames = games.filter((game) => game.id !== gameToDelete.id)
    setGames(newGames)

    // If the deleted game is the selected game, clear it
    if (selectedGame && selectedGame.id === gameToDelete.id) {
      setSelectedGame(null)
    }

    // If the deleted game is being viewed in details, close the modal
    if (gameToView && gameToView.id === gameToDelete.id) {
      setShowGameDetailsModal(false)
    }

    setShowDeleteConfirm(false)
    setGameToDelete(null)
  }

  const handleSpin = () => {
    if (games.length === 0) {
      alert("Adicione jogos antes de sortear!")
      return
    }

    setIsSpinning(true)
  }

  const handleSelectionComplete = (game: Game) => {
    setSelectedGame(game)
    setIsSpinning(false)
  }

  const handleViewGameDetails = (game: Game) => {
    setGameToView(game)
    setShowGameDetailsModal(true)
  }

  const handleEditGame = (game: Game) => {
    setEditGame({ ...game })
    setShowEditGameModal(true)
  }

  const handleConfirmDelete = (game: Game) => {
    setGameToDelete(game)
    setShowDeleteConfirm(true)
  }

  const toggleGamePlayed = (gameId: string) => {
    setGames(games.map((game) => (game.id === gameId ? { ...game, played: !game.played } : game)))
  }

  const exportGamesToFile = () => {
    const dataStr = JSON.stringify(games, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    const exportFileDefaultName = `repingo-games-${new Date().toISOString().slice(0, 10)}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const importGamesFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const importedGames = JSON.parse(event.target?.result as string) as Game[]
        setGames(importedGames)
        localStorage.setItem("repingoGames", JSON.stringify(importedGames))
        alert(`${importedGames.length} jogos importados com sucesso!`)
      } catch (error) {
        alert("Erro ao importar jogos. Verifique se o arquivo está no formato correto.")
        console.error(error)
      }
    }
    reader.readAsText(file)

    // Reset the input
    e.target.value = ""
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <img
              src="https://private-user-images.githubusercontent.com/111826126/429703574-489de22e-f97e-431e-97c1-8b4f96c6f303.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDM2MzY0NjYsIm5iZiI6MTc0MzYzNjE2NiwicGF0aCI6Ii8xMTE4MjYxMjYvNDI5NzAzNTc0LTQ4OWRlMjJlLWY5N2UtNDMxZS05N2MxLThiNGY5NmM2ZjMwMy5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjUwNDAyJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI1MDQwMlQyMzIyNDZaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT1iMzNkNWI4YjM3NjFjMDQwMmQ3ZjhiMWEyOGYyZTcwN2Q0ZmQxOGVmZjdmMTYxYWExYzQ3ZTE5ZmViODM4MmFiJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.U0K5AqfqO4QtMTvt2L-C4FnMzD-c6x2T6kXZGdaR_Eo"
              alt="Silhueta de peixe"
              className="h-24 md:h-32 w-auto filter drop-shadow-lg"
            />
            <motion.div
              animate={{
                rotate: [0, 5, 0, -5, 0],
                x: [0, 3, 0, -3, 0],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 5,
                ease: "easeInOut",
              }}
              className="absolute inset-0 opacity-0 hover:opacity-100"
            >
              <img
                src="https://private-user-images.githubusercontent.com/111826126/429703574-489de22e-f97e-431e-97c1-8b4f96c6f303.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDM2MzY0NjYsIm5iZiI6MTc0MzYzNjE2NiwicGF0aCI6Ii8xMTE4MjYxMjYvNDI5NzAzNTc0LTQ4OWRlMjJlLWY5N2UtNDMxZS05N2MxLThiNGY5NmM2ZjMwMy5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjUwNDAyJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI1MDQwMlQyMzIyNDZaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT1iMzNkNWI4YjM3NjFjMDQwMmQ3ZjhiMWEyOGYyZTcwN2Q0ZmQxOGVmZjdmMTYxYWExYzQ3ZTE5ZmViODM4MmFiJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.U0K5AqfqO4QtMTvt2L-C4FnMzD-c6x2T6kXZGdaR_Eo"
                alt="Silhueta de peixe animada"
                className="h-24 md:h-32 w-auto filter drop-shadow-lg"
              />
            </motion.div>
          </motion.div>
        </div>

        <h1 className="text-4xl font-bold text-green-100 mb-2 flex items-center justify-center">
          <Gamepad className="w-8 h-8 mr-2 text-green-300" />
          rePINGO da Peixada
          <Gamepad className="w-8 h-8 ml-2 text-green-300" />
        </h1>
        <p className="text-green-200 text-xl">Biblioteca de Jogos Sorteáveis - by JJdev</p>
        <div className="flex justify-center gap-4 mt-2">
          <Button
            onClick={exportGamesToFile}
            variant="outline"
            className="text-green-200 border-green-500 hover:bg-green-800"
          >
            Exportar Jogos
          </Button>
          <label htmlFor="import-games" className="cursor-pointer">
            <Button
              variant="outline"
              className="text-green-200 border-green-500 hover:bg-green-800"
              onClick={() => document.getElementById("import-games")?.click()}
            >
              Importar Jogos
            </Button>
            <input id="import-games" type="file" accept=".json" className="hidden" onChange={importGamesFromFile} />
          </label>
        </div>
      </header>

      <div className="flex flex-col gap-8">
        {/* Roda de Sorteio */}
        <Card className="bg-green-800/40 border-green-600 shadow-xl backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-green-100">Roda de Sorteio</h2>
              <Button
                onClick={handleSpin}
                disabled={isSpinning || games.length === 0}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                {isSpinning ? "Sorteando..." : "Sortear Jogo"}
              </Button>
            </div>

            <GameProgress
              games={games}
              isSelecting={isSpinning}
              selectedGame={selectedGame}
              onSelectionComplete={handleSelectionComplete}
            />

            {selectedGame && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-4 bg-green-700/60 rounded-lg border border-green-500 shadow-lg"
              >
                <h3 className="text-xl font-bold text-green-100 mb-2">Jogo da Vez</h3>
                <div className="flex items-center">
                  <div className="w-24 h-24 rounded-md overflow-hidden mr-4 flex-shrink-0">
                    <img
                      src={selectedGame.imageUrl || "/placeholder.svg?height=96&width=96"}
                      alt={selectedGame.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{selectedGame.name}</h4>
                    <p className="text-green-200 line-clamp-2">{selectedGame.description}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-green-300 text-sm mr-4">Jogadores: {selectedGame.maxPlayers}</span>
                      {selectedGame.availableOnHydra && (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">Disponível na Hydra</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Biblioteca de Jogos */}
        <Card className="bg-green-800/40 border-green-600 shadow-xl backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-green-100">Biblioteca de Jogos</h2>
              <Button onClick={() => setShowAddGameModal(true)} className="bg-green-500 hover:bg-green-600 text-white">
                <Plus className="w-4 h-4 mr-1" /> Adicionar
              </Button>
            </div>

            <GameList
              games={sortedGames}
              onViewDetails={handleViewGameDetails}
              onTogglePlayed={toggleGamePlayed}
              onEditGame={handleEditGame}
              onDeleteGame={handleConfirmDelete}
            />
          </CardContent>
        </Card>
      </div>

      {/* Add Game Modal */}
      <Dialog open={showAddGameModal} onOpenChange={setShowAddGameModal}>
        <DialogContent className="bg-green-900 border-green-600 text-green-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-green-100">Adicionar Novo Jogo</DialogTitle>
            <DialogDescription className="text-green-300">
              Preencha os detalhes do jogo que deseja adicionar à biblioteca.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="name" className="text-green-200">
                Nome do Jogo *
              </Label>
              <Input
                id="name"
                name="name"
                value={newGame.name}
                onChange={handleInputChange}
                className="bg-green-800/60 border-green-600 text-white"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-green-200">
                Descrição *
              </Label>
              <Textarea
                id="description"
                name="description"
                value={newGame.description}
                onChange={handleInputChange}
                className="bg-green-800/60 border-green-600 text-white"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="maxPlayers" className="text-green-200">
                Número Máximo de Jogadores
              </Label>
              <Input
                id="maxPlayers"
                name="maxPlayers"
                type="number"
                min="1"
                value={newGame.maxPlayers}
                onChange={handleNumberChange}
                className="bg-green-800/60 border-green-600 text-white"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="availableOnHydra"
                checked={newGame.availableOnHydra}
                onCheckedChange={handleCheckboxChange}
                className="border-green-500 data-[state=checked]:bg-green-500"
              />
              <Label htmlFor="availableOnHydra" className="text-green-200">
                Disponível na Hydra
              </Label>
            </div>

            <div>
              <Label htmlFor="imageUrl" className="text-green-200">
                URL da Imagem
              </Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={newGame.imageUrl}
                onChange={handleInputChange}
                className="bg-green-800/60 border-green-600 text-white"
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>

            <div>
              <Label htmlFor="addedBy" className="text-green-200">
                Sugerido por *
              </Label>
              <Input
                id="addedBy"
                name="addedBy"
                value={newGame.addedBy}
                onChange={handleInputChange}
                className="bg-green-800/60 border-green-600 text-white"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="played"
                checked={newGame.played}
                onCheckedChange={(checked) => setNewGame({ ...newGame, played: !!checked })}
                className="border-green-500 data-[state=checked]:bg-green-500"
              />
              <Label htmlFor="played" className="text-green-200">
                Já foi jogado
              </Label>
            </div>

            <Button onClick={handleAddGame} className="w-full bg-green-500 hover:bg-green-600 text-white mt-4">
              Adicionar Jogo
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Game Modal */}
      <Dialog open={showEditGameModal} onOpenChange={setShowEditGameModal}>
        <DialogContent className="bg-green-900 border-green-600 text-green-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-green-100">Editar Jogo</DialogTitle>
            <DialogDescription className="text-green-300">Atualize as informações do jogo.</DialogDescription>
          </DialogHeader>

          {editGame && (
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="edit-name" className="text-green-200">
                  Nome do Jogo *
                </Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={editGame.name}
                  onChange={handleEditInputChange}
                  className="bg-green-800/60 border-green-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="edit-description" className="text-green-200">
                  Descrição *
                </Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={editGame.description}
                  onChange={handleEditInputChange}
                  className="bg-green-800/60 border-green-600 text-white"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="edit-maxPlayers" className="text-green-200">
                  Número Máximo de Jogadores
                </Label>
                <Input
                  id="edit-maxPlayers"
                  name="maxPlayers"
                  type="number"
                  min="1"
                  value={editGame.maxPlayers}
                  onChange={handleEditNumberChange}
                  className="bg-green-800/60 border-green-600 text-white"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-availableOnHydra"
                  checked={editGame.availableOnHydra}
                  onCheckedChange={(checked) => handleEditCheckboxChange("availableOnHydra", !!checked)}
                  className="border-green-500 data-[state=checked]:bg-green-500"
                />
                <Label htmlFor="edit-availableOnHydra" className="text-green-200">
                  Disponível na Hydra
                </Label>
              </div>

              <div>
                <Label htmlFor="edit-imageUrl" className="text-green-200">
                  URL da Imagem
                </Label>
                <Input
                  id="edit-imageUrl"
                  name="imageUrl"
                  value={editGame.imageUrl}
                  onChange={handleEditInputChange}
                  className="bg-green-800/60 border-green-600 text-white"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>

              <div>
                <Label htmlFor="edit-addedBy" className="text-green-200">
                  Sugerido por *
                </Label>
                <Input
                  id="edit-addedBy"
                  name="addedBy"
                  value={editGame.addedBy}
                  onChange={handleEditInputChange}
                  className="bg-green-800/60 border-green-600 text-white"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-played"
                  checked={editGame.played}
                  onCheckedChange={(checked) => handleEditCheckboxChange("played", !!checked)}
                  className="border-green-500 data-[state=checked]:bg-green-500"
                />
                <Label htmlFor="edit-played" className="text-green-200">
                  Já foi jogado
                </Label>
              </div>

              <DialogFooter className="flex justify-between gap-2 pt-2">
                <Button
                  variant="destructive"
                  onClick={() => handleConfirmDelete(editGame)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Excluir
                </Button>
                <Button onClick={handleUpdateGame} className="bg-green-500 hover:bg-green-600 text-white">
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Game Details Modal */}
      <Dialog open={showGameDetailsModal} onOpenChange={setShowGameDetailsModal}>
        <DialogContent className="bg-green-900 border-green-600 text-green-100 max-w-md">
          {gameToView && <GameDetails game={gameToView} onClose={() => setShowGameDetailsModal(false)} />}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-green-900 border-red-600 text-green-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-white">Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-green-200">
              Tem certeza que deseja excluir o jogo "{gameToDelete?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-end gap-2">
            <AlertDialogCancel className="bg-green-800 text-white hover:bg-green-700">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteGame} className="bg-red-600 text-white hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

