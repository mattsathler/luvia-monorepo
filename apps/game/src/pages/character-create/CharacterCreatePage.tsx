import { LuvIcon, LuvInput, LuvStepper, LuvStepperStep, Tab, Tabs, luviaLogo } from "luv-ui";
import { useAuth } from "../../auth/AuthContext";
import type { Character } from "../../lib/api";
import { Player } from "../../components/Player/Player";
import { LayerOptionPicker } from "./LayerOptionPicker";
import {
    GENDER_OPTIONS,
    STEPS,
    useCharacterCreatePageController,
} from "./CharacterCreatePage.controller";

type CharacterCreatePageProps = {
    onCharacterCreated: (character: Character) => void;
    onCancel: () => void;
};

export function CharacterCreatePage({ onCharacterCreated, onCancel }: CharacterCreatePageProps) {
    const { accessToken } = useAuth();

    // Esta página só é montada quando o jogador está autenticado (ver
    // AppContent em App.tsx), então accessToken sempre existe aqui — o guard
    // só evita um `as string` no restante do componente.
    if (!accessToken) {
        return null;
    }

    return (
        <CharacterCreatePageContent
            accessToken={accessToken}
            onCharacterCreated={onCharacterCreated}
            onCancel={onCancel}
        />
    );
}

type CharacterCreatePageContentProps = CharacterCreatePageProps & {
    accessToken: string;
};

function CharacterCreatePageContent({ accessToken, onCharacterCreated, onCancel }: CharacterCreatePageContentProps) {
    const {
        activeStep,
        setActiveStep,
        firstName,
        setFirstName,
        lastName,
        setLastName,
        gender,
        setGender,
        skinToneId,
        setSkinToneId,
        hairType,
        setHairType,
        faceId,
        setFaceId,
        topId,
        setTopId,
        pantsId,
        setPantsId,
        shoesId,
        setShoesId,
        overlayId,
        setOverlayId,
        submitError,
        isSubmitting,
        isValid,
        handleSubmit,
    } = useCharacterCreatePageController({ accessToken, onCharacterCreated });

    return (
        <div className="d-flex flex-col items-center justify-center w-full h-full p-24">
            <form onSubmit={handleSubmit} className="d-flex flex-col gap items-center w-100-p">
                <div className="w-100-p d-flex flex-col gap max-w-screen-2xl">
                    <div className="d-flex items-center gap-8">
                        <button
                            type="button"
                            className="circle w-32 h-32"
                            aria-label="Voltar para seleção de personagens"
                            onClick={onCancel}
                        >
                            <LuvIcon name="arrow_back_ios_new" size={16} />
                        </button>
                        <h1 className="text-text">Crie seu personagem</h1>
                    </div>

                    <LuvStepper
                        steps={STEPS}
                        activeStep={activeStep}
                        onStepChange={setActiveStep}
                        completedSteps={STEPS.map((step) => step.id)}
                        color="game-cyan"
                    >
                        <div className="d-flex flex-row w-100-p gap">
                            <div className="d-flex w-full flex-col gap w-50-p card flat border-border border-16">
                                <LuvStepperStep step="info">
                                    <div className="d-flex flex-col gap h-240">
                                        <div className="d-flex flex-row gap">
                                            <LuvInput
                                                type="text"
                                                label="Nome"
                                                placeholder="Digite o nome do personagem"
                                                value={firstName}
                                                onChange={(event) => setFirstName(event.target.value)}
                                                className="luv-blue w-100-p"
                                                required
                                            />
                                            <LuvInput
                                                type="text"
                                                label="Sobrenome"
                                                placeholder="Digite o sobrenome do personagem"
                                                value={lastName}
                                                onChange={(event) => setLastName(event.target.value)}
                                                className="w-100-p"
                                                required
                                            />
                                        </div>
                                        <div className="d-flex flex-col gap-8">
                                            <h4 className="text-text">Gênero</h4>
                                            <div className="d-flex flex-wrap w-100-p gap">
                                                {GENDER_OPTIONS.map((option) => (
                                                    <button
                                                        key={option.value}
                                                        type="button"
                                                        className={gender === option.value ? `game-${option.color}` : `outline game-${option.color}`}
                                                        aria-pressed={gender === option.value}
                                                        aria-label={option.icon ? option.label : undefined}
                                                        onClick={() => setGender(option.value)}
                                                    >
                                                        {option.icon ? <LuvIcon name={option.icon} /> : option.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </LuvStepperStep>

                                <LuvStepperStep step="appearance">
                                    <div className="d-flex flex-col flex-1-1 h-full">
                                        <Tabs orientation="vertical">
                                            <Tab title="Corpo" icon={<LuvIcon name="body" />} color="game-cyan">
                                                <LayerOptionPicker
                                                    category="body_types"
                                                    selectedId={skinToneId}
                                                    onSelect={setSkinToneId}
                                                />
                                            </Tab>
                                            <Tab title="Rosto" icon={<LuvIcon name="face" />} color="game-cyan">
                                                <LayerOptionPicker
                                                    category="faces"
                                                    selectedId={faceId}
                                                    onSelect={setFaceId}
                                                />
                                            </Tab>
                                            <Tab title="Cabelo" icon={<LuvIcon name="hair" />} color="game-cyan">
                                                <LayerOptionPicker
                                                    category="hair_types"
                                                    selectedId={hairType}
                                                    onSelect={setHairType}
                                                />
                                            </Tab>
                                            <Tab title="Calça" icon={<LuvIcon name="pants" />} color="game-cyan">
                                                <LayerOptionPicker
                                                    category="pants"
                                                    selectedId={pantsId}
                                                    onSelect={setPantsId}
                                                />
                                            </Tab>
                                            <Tab title="Blusa" icon={<LuvIcon name="blouse" />} color="game-cyan">
                                                <LayerOptionPicker
                                                    category="tops"
                                                    selectedId={topId}
                                                    onSelect={setTopId}
                                                />
                                            </Tab>
                                            <Tab title="Sobreposição" icon={<LuvIcon name="overlay" />} color="game-cyan">
                                                <LayerOptionPicker
                                                    category="overlays"
                                                    selectedId={overlayId}
                                                    onSelect={setOverlayId}
                                                />
                                            </Tab>
                                            <Tab title="Sapato" icon={<LuvIcon name="shoes" />} color="game-cyan">
                                                <LayerOptionPicker
                                                    category="shoes"
                                                    selectedId={shoesId}
                                                    onSelect={setShoesId}
                                                />
                                            </Tab>
                                        </Tabs>
                                    </div>
                                </LuvStepperStep>
                            </div>

                            <div className="d-flex items-center justify-center w-50-p card flat aspect-4-3 hidden border-border border-16">
                                <div className="w-full h-164 object-contain">
                                    <Player
                                        layers={{
                                            body_types: skinToneId,
                                            faces: faceId,
                                            hair_types: hairType,
                                            pants: pantsId,
                                            shoes: shoesId,
                                            tops: topId,
                                            overlays: overlayId,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </LuvStepper>

                    {submitError && (
                        <div className="card error w-full p-16">
                            <strong className="text-primary">{submitError}</strong>
                        </div>
                    )}
                    <div className="d-flex w-100-p gap justify-end">
                        <button type="submit" className="game-green" disabled={!isValid || isSubmitting}>
                            {isSubmitting ? "Criando..." : "Criar personagem"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
