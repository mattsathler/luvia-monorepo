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
        skillDefinitions,
        skillsError,
        skills,
        incrementSkill,
        decrementSkill,
        remainingPoints,
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
                            className="outline primary circle w-32 h-32"
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
                                        <Tabs>
                                            <Tab title="Corpo" color="game-teal">
                                                <LayerOptionPicker
                                                    category="body_types"
                                                    selectedId={skinToneId}
                                                    onSelect={setSkinToneId}
                                                />
                                            </Tab>
                                            <Tab title="Rosto" color="game-teal">
                                                <LayerOptionPicker
                                                    category="faces"
                                                    selectedId={faceId}
                                                    onSelect={setFaceId}
                                                />
                                            </Tab>
                                            <Tab title="Cabelo" color="game-teal">
                                                <LayerOptionPicker
                                                    category="hair_types"
                                                    selectedId={hairType}
                                                    onSelect={setHairType}
                                                />
                                            </Tab>
                                            <Tab title="Calça" color="game-teal">
                                                <LayerOptionPicker
                                                    category="pants"
                                                    selectedId={pantsId}
                                                    onSelect={setPantsId}
                                                />
                                            </Tab>
                                            <Tab title="Blusa" color="game-teal">
                                                <LayerOptionPicker
                                                    category="tops"
                                                    selectedId={topId}
                                                    onSelect={setTopId}
                                                />
                                            </Tab>
                                            <Tab title="Sobreposição" color="game-teal">
                                                <LayerOptionPicker
                                                    category="overlays"
                                                    selectedId={overlayId}
                                                    onSelect={setOverlayId}
                                                />
                                            </Tab>
                                            <Tab title="Sapato" color="game-teal">
                                                <LayerOptionPicker
                                                    category="shoes"
                                                    selectedId={shoesId}
                                                    onSelect={setShoesId}
                                                />
                                            </Tab>
                                        </Tabs>
                                    </div>
                                </LuvStepperStep>

                                <LuvStepperStep step="skills">
                                    <div className="w-100-p">

                                        <span className="text-size-16 text-text text-bold">
                                            Pontos restantes: {skillsError ? "-" : Math.max(remainingPoints, 0)}
                                        </span>

                                        {skillsError && (
                                            <div className="card error w-full p-16">
                                                <strong className="text-primary">{skillsError}</strong>
                                            </div>
                                        )}

                                        {!skillsError && skillDefinitions === null && (
                                            <p className="text-text">Carregando skills...</p>
                                        )}

                                        {skillDefinitions !== null && (
                                            <div className="d-flex flex-col gap-8 w-full">
                                                {skillDefinitions.map((skill) => (
                                                    <div key={skill.id} className="d-flex items-center justify-between gap-8 w-full">
                                                        <span className="text-text">{skill.label}</span>
                                                        <div className="d-flex items-center gap-8">
                                                            <button
                                                                type="button"
                                                                className="outline primary circle w-24 h-24"
                                                                aria-label={`Diminuir ${skill.label}`}
                                                                onClick={() => decrementSkill(skill.id)}
                                                                disabled={skills[skill.id] <= 0}
                                                            >
                                                                −
                                                            </button>
                                                            <strong className="text-text">{skills[skill.id]}</strong>
                                                            <button
                                                                type="button"
                                                                className="outline primary circle w-24 h-24"
                                                                aria-label={`Aumentar ${skill.label}`}
                                                                onClick={() => incrementSkill(skill.id)}
                                                                disabled={remainingPoints <= 0}
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
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
