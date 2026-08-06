import { useEffect, useState, type FormEvent } from "react";
import { LuvInput, luviaLogo } from "luv-ui";
import { useAuth } from "../../auth/AuthContext";
import {
    ApiError,
    createCharacter,
    listSkills,
    type Character,
    type Gender,
    type SkillDefinition,
    type SkinTone,
} from "../../lib/api";
import { Player } from "../../components/Player/Player";
import { LayerOptionPicker } from "./LayerOptionPicker";

type CharacterCreatePageProps = {
    onCharacterCreated: (character: Character) => void;
    onCancel: () => void;
};

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
    { value: "male", label: "Masculino" },
    { value: "female", label: "Feminino" },
    { value: "other", label: "Outro" },
];

const SKILL_POINTS_BUDGET = 4;

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

// Os campos abaixo ainda não são escolhidos pelo jogador na criação — nascem
// no primeiro item disponível em cada categoria (ver docs/decisions/0020-...).
const DEFAULT_FACE_ID = "0";
const DEFAULT_CLOTHES_ID = "0";
const DEFAULT_HAIR_TYPE_ID = "0";
const DEFAULT_EYE_TYPE_ID = "0";

function CharacterCreatePageContent({ accessToken, onCharacterCreated, onCancel }: CharacterCreatePageContentProps) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [gender, setGender] = useState<Gender>(GENDER_OPTIONS[0].value);
    const [skinToneId, setSkinToneId] = useState("3");
    const [hairType, setHairType] = useState(DEFAULT_HAIR_TYPE_ID);
    const [eyeType, setEyeType] = useState(DEFAULT_EYE_TYPE_ID);

    const [skillDefinitions, setSkillDefinitions] = useState<SkillDefinition[] | null>(null);
    const [skillsError, setSkillsError] = useState<string | null>(null);
    const [skills, setSkills] = useState<Record<string, number>>({});

    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        listSkills(accessToken)
            .then((definitions) => {
                setSkillDefinitions(definitions);
                setSkills(Object.fromEntries(definitions.map((skill) => [skill.id, 0])));
            })
            .catch(() => setSkillsError("Não foi possível carregar as skills. Tente novamente."));
    }, [accessToken]);

    const allocatedPoints = Object.values(skills).reduce((sum, points) => sum + points, 0);
    const remainingPoints = SKILL_POINTS_BUDGET - allocatedPoints;

    // Só chamadas pelos botões +/- abaixo, que já ficam `disabled` fora desses
    // limites — não há caminho de UI para invocar isto fora do intervalo.
    function incrementSkill(skillId: string) {
        setSkills((current) => ({ ...current, [skillId]: current[skillId] + 1 }));
    }

    function decrementSkill(skillId: string) {
        setSkills((current) => ({ ...current, [skillId]: current[skillId] - 1 }));
    }

    const isValid = firstName.trim() !== "" && lastName.trim() !== "" && remainingPoints === 0;

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        setSubmitError(null);
        setIsSubmitting(true);

        try {
            const character = await createCharacter(accessToken, {
                firstName,
                lastName,
                gender,
                skinTone: Number(skinToneId) as SkinTone,
                hairType,
                eyeType,
                skills,
            });
            onCharacterCreated(character);
        } catch (err) {
            if (err instanceof ApiError) {
                setSubmitError(err.message);
            } else {
                setSubmitError("Não foi possível criar seu personagem. Tente novamente.");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="d-flex flex-col items-center justify-center w-full h-full p-24">
            <img src={luviaLogo} alt="Luvia" className="w-50-p max-w-640" />

            <form onSubmit={handleSubmit} className="d-flex flex-col gap items-center">
                <div className="w-100-p d-flex flex-col gap">
                    <h1 className="text-text">Crie seu personagem</h1>
                    <div className="card w-100-p d-flex flex-col gap">
                        <h3 className="text-center">Informações</h3>
                        <div className="d-flex gap">
                            <LuvInput
                                type="text"
                                label="Nome"
                                placeholder="Digite o nome do personagem"
                                value={firstName}
                                onChange={(event) => setFirstName(event.target.value)}
                                className="w-100-p"
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
                    </div>
                    <div className="d-flex flex-row w-100-p gap">
                        <div className="d-flex w-full flex-col gap w-100-p card max-h-480 scroll-y">
                            <h3 className="text-center">Personalização</h3>

                            <div className="d-flex flex-col gap-8 w-full">
                                <span className="text-size-16 text-text text-bold">Gênero</span>
                                <div className="d-flex flex-wrap gap-8">
                                    {GENDER_OPTIONS.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            className={gender === option.value ? "primary" : "outline primary"}
                                            aria-pressed={gender === option.value}
                                            onClick={() => setGender(option.value)}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <LayerOptionPicker
                                category="body_types"
                                label="Tom de pele"
                                selectedId={skinToneId}
                                onSelect={setSkinToneId}
                            />

                            <LayerOptionPicker
                                category="hair_types"
                                label="Tipo de cabelo"
                                selectedId={hairType}
                                onSelect={setHairType}
                            />

                            <LayerOptionPicker
                                category="eye_types"
                                label="Tipo de olho"
                                selectedId={eyeType}
                                onSelect={setEyeType}
                            />
                        </div>
                        <div className="d-flex items-center justify-center w-100-p w-640 card max-h-480 hidden">
                            <Player
                                layers={{
                                    body_types: skinToneId,
                                    faces: DEFAULT_FACE_ID,
                                    clothes: DEFAULT_CLOTHES_ID,
                                }}
                            />
                        </div>
                        <div className="d-flex w-full flex-col gap items-end w-100-p card max-h-480 scroll-y">

                            <div className="d-flex flex-col gap-8 w-full">
                                <h3 className="text-center">Habilidades</h3>
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
                        </div>
                    </div>
                    {submitError && (
                        <div className="card error w-full p-16">
                            <strong className="text-primary">{submitError}</strong>
                        </div>
                    )}
                    <div className="d-flex w-100-p gap justify-end">

                        <button type="button" className="outline primary" onClick={onCancel}>
                            Voltar
                        </button>
                        <button type="submit" className="primary" disabled={!isValid || isSubmitting}>
                            {isSubmitting ? "Criando..." : "Criar personagem"}
                        </button>
                    </div>

                </div>
            </form>
        </div >
    );
}
