import { useEffect, useState, type FormEvent } from "react";
import type { LuvStep } from "luv-ui";
import {
    ApiError,
    createCharacter,
    listSkills,
    updateAppearance,
    type Character,
    type Gender,
    type SkillDefinition,
    type SkinTone,
} from "../../lib/api";

// "male"/"female" têm ícone dedicado no Material Icons; "other" não tem um
// símbolo universal equivalente, então continua mostrando o rótulo em texto.
export const GENDER_OPTIONS: { value: Gender; label: string; icon?: string; color: string }[] = [
    { value: "male", label: "Masculino", icon: "male", color: "blue" },
    { value: "female", label: "Feminino", icon: "female", color: "pink" },
    { value: "other", label: "Outro", color: "gray" },
];

export const SKILL_POINTS_BUDGET = 4;

export const STEPS: LuvStep[] = [
    { id: "info", label: "Informações" },
    { id: "appearance", label: "Personalização" },
    { id: "skills", label: "Skills" },
];

// Ponto de partida de cada seletor — o primeiro item disponível em cada
// categoria (ver docs/decisions/0020-...). `hairType`/`eyeType` ainda não têm
// PNG real (ver Pendências no doc), então continuam sem seletor na UI.
const DEFAULT_FACE_ID = "0";
const DEFAULT_PANTS_ID = "0";
const DEFAULT_SHOES_ID = "0";
const DEFAULT_TOP_ID = "0";
const DEFAULT_OVERLAY_ID = "0";
const DEFAULT_HAIR_TYPE_ID = "0";
const DEFAULT_EYE_TYPE_ID = "0";

type UseCharacterCreatePageControllerParams = {
    accessToken: string;
    onCharacterCreated: (character: Character) => void;
};

export function useCharacterCreatePageController({
    accessToken,
    onCharacterCreated,
}: UseCharacterCreatePageControllerParams) {
    // Cada passo guarda dados persistentes e editáveis, então o jogador pode
    // ir e voltar livremente — nenhum passo fica bloqueado atrás do outro.
    const [activeStep, setActiveStep] = useState<string>(STEPS[0].id);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [gender, setGender] = useState<Gender>(GENDER_OPTIONS[0].value);
    const [skinToneId, setSkinToneId] = useState("3");
    const [hairType, setHairType] = useState(DEFAULT_HAIR_TYPE_ID);
    const [eyeType, setEyeType] = useState(DEFAULT_EYE_TYPE_ID);
    const [faceId, setFaceId] = useState(DEFAULT_FACE_ID);
    const [topId, setTopId] = useState(DEFAULT_TOP_ID);
    const [pantsId, setPantsId] = useState(DEFAULT_PANTS_ID);
    const [shoesId, setShoesId] = useState(DEFAULT_SHOES_ID);
    const [overlayId, setOverlayId] = useState(DEFAULT_OVERLAY_ID);

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
            // Roupa/rosto ainda não são aceitos na criação (só via `PATCH .../appearance`,
            // ver docs/decisions/0020-...) — aplicamos as escolhas do jogador logo em seguida.
            const withAppearance = await updateAppearance(accessToken, character.id, {
                face: faceId,
                top: topId,
                pants: pantsId,
                shoes: shoesId,
                overlay: overlayId,
            });
            onCharacterCreated(withAppearance);
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

    return {
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
    };
}
