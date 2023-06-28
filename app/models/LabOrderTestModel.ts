// Model Name    :LabOrderTestsModel
// Date Created  : 8/1/2022
// Written By    : Stephen Farkas
// Description   : Lab Order Test Models
// MM/DD/YYYY XXX Description
// 01/09/2023 SJF Added ToxOral
//------------------------------------------------------------------------

export class ToxModel{
    fullConfirmationOnly: boolean = false;
    fullScreenAndConfirmation: boolean = false;
    targetReflex: boolean = false;
    universalReflex: boolean = false;
    custom: boolean = false;
    presumptiveTesting15: boolean = false;
    presumptiveTesting13: boolean = false;
    alcohol = new AlcoholModel();
    antidepressants = new AntidepressantsModel();
    antipsychotics = new AntipsychoticsModel();
    benzodiazepines = new BenzodiazepinesModel();
    cannabinoids = new CannabinoidsModel();
    cannabinoidsSynth = new CannabinoidsSynthModel();
    dissociative = new DissociativeModel();
    gabapentinoids  = new GabapentinoidsModel();
    hallucinogens = new HallucinogensModel();
    illicit = new IllicitModel();
    kratom:boolean = false;
    opioidAgonists = new OpioidAgonistsModel();
    opioidAntagonists = new OpioidAntagonistsModel();
    sedative = new SedativeModel();
    skeletal  = new SkeletalModel();
    stimulants = new StimulantsModel()
    thcSource:boolean = false;    
}

export class AlcoholModel{
    full: boolean = false;
    etg: boolean = false;
    ets: boolean = false;
    nicotine: boolean = false;
}
export class AntidepressantsModel{
    full: boolean = false;
    amitriptyline: boolean = false;
    doxepin: boolean = false;
    imipramine: boolean = false;
    mirtazapine: boolean = false;
    citalopram: boolean = false;
    duloxetine: boolean = false;
    fluoxetine: boolean = false;
    paroxetine: boolean = false;
    sertraline: boolean = false;
    bupropion: boolean = false;
    trazodone: boolean = false;
    venlafaxine: boolean = false;
    vortioxetine: boolean = false;
}
export class AntipsychoticsModel{
    full: boolean = false;
    aripiprazole: boolean = false;
    haloperidol: boolean = false;
    lurasidone: boolean = false;
    olanzapine: boolean = false;
    quetiapine: boolean = false;
    risperidone: boolean = false;
    ziprasidone: boolean = false;
}
export class BenzodiazepinesModel{
    full: boolean = false;
    alprazolam: boolean = false;
    chlordiazepoxide: boolean = false;
    clonazepam: boolean = false;
    clonazolam: boolean = false;
    etizolam: boolean = false;
    flualprazolam: boolean = false;
    lorazepam: boolean = false;
    midazolam: boolean = false;
    oxazepam: boolean = false;
    temazepam: boolean = false;
    triazolam: boolean = false;
}
export class CannabinoidsModel{
    full: boolean = false;
    cbd: boolean = false;
    thc: boolean = false;
}
export class CannabinoidsSynthModel{
    full: boolean = false;
    adb: boolean = false;
    mdmb: boolean = false;
    mdmb5f: boolean = false; 
}
export class  DissociativeModel{
    full: boolean = false;
    ketamine: boolean = false;
    pcp: boolean = false;
    
}
export class GabapentinoidsModel{
    full: boolean = false;
    gabapentin: boolean = false;
    pregabalin: boolean = false;
}
export class  HallucinogensModel{
    full: boolean = false;
    lsd: boolean = false;
    psilocybin: boolean = false;
    
}
export class  IllicitModel{
    full: boolean = false;
    amphetamine: boolean = false;
    cocaine: boolean = false;
    heroin: boolean = false;
    mdma: boolean = false;
    methamphetamine: boolean = false;
    methamphetaminePosative: boolean = false;
    pcp: boolean = false;
}
export class  OpioidAgonistsModel{
    full: boolean = false;
    codeine: boolean = false;  
    dihydrocodeine: boolean = false;  
    hydrocodone: boolean = false;  
    norhydrocodone: boolean = false;  
    hydromorphone: boolean = false;  
    morphine: boolean = false;  
    dextromethorphan: boolean = false;  
    levorphanol: boolean = false;  
    meperidine: boolean = false;  
    oxycodone: boolean = false;  
    oxymorphone: boolean = false;  
    noroxycodone: boolean = false;  
    tramadol: boolean = false;  
    tapentadol: boolean = false;  
    fentanyl: boolean = false;  
    norfentanyl: boolean = false;  
    acetylfentanyl: boolean = false;  
    carfentanil: boolean = false;  
    norcarfentanil: boolean = false;  
    fluorofentanyl: boolean = false;  
    buprenorphine: boolean = false;  
    norbuprenorphine: boolean = false;  
    methadone: boolean = false;  
    eddp: boolean = false;  
    isotonitazene: Boolean = false;
    tianeptine: Boolean = false;
}
export class OpioidAntagonistsModel{
    full: boolean = false;
    naloxone: boolean = false;  
    nalmefene: boolean = false;  
    naltrexone: boolean = false;  
}
export class SedativeModel{
    full: boolean = false;
    butalbital: boolean = false; 
    xylazine: boolean = false; 
    zolpidem: boolean = false; 
    zopiclone: boolean = false; 
    phenibut: boolean = false;
}
export class SkeletalModel{
    full: boolean = false;
    baclofen: boolean = false; 
    carisoprodol: boolean = false; 
    cyclobenzaprine: boolean = false; 
    meprobamate: boolean = false; 
    methocarbamol: boolean = false; 
    tizanidine: boolean = false; 
}
export class StimulantsModel{
    full: boolean = false;
    benzylone: boolean = false; 
    eutylone: boolean = false; 
    mda: boolean = false;
    methylphenidate: boolean = false; 
    phentermine: boolean = false; 
}

export class ToxOralModel{
    fullConfirmation: boolean = false;
    illicit = new OralIllicitModel();
    sedative = new OralSedativeModel();
    benzodiazepines = new OralBenzodiazepinesModel();
    muscle = new OralMuscleModel();
    antipsychotics = new OralAntipsychoticsModel();
    antidepressants = new OralAntidepressantsModel();
    stimulants = new OralStimulantsModel();
    kratom = new OralKratomModel();
    nicotine = new OralNicotineModel();
    opioidAntagonists = new OralOpioidAntagonistsModel();
    gabapentinoids  = new OralGabapentinoidsModel();
    dissociative = new OralDissociativeModel();
    opioidAgonists = new OralOpioidAgonistsModel();   
}

export class  OralIllicitModel{
    full: boolean = false;
    mam6: boolean = false;
    amphetamine: boolean = false;
    methamphetamine: boolean = false;
    benzoylecgonine: boolean = false;
    mdma: boolean = false;
    pcp: boolean = false;  
    thc: boolean = false;
}
export class OralSedativeModel{
    full: boolean = false;
    zolpidem: boolean = false;
    butalbital: boolean = false;
}
export class OralBenzodiazepinesModel{
    full: boolean = false;
    alprazolam: boolean = false;
    diazepam: boolean = false;
    clonazepam: boolean = false;
    aminoclonazepam: boolean = false;
    nordiazepam: boolean = false;
    lorazepam: boolean = false;
    oxazepam: boolean = false;
    temazepam: boolean = false;
}
export class OralMuscleModel{
    full: boolean = false;
    baclofen: boolean = false;
    carisoprodol: boolean = false; 
    cyclobenzaprine: boolean = false; 
    meprobamate: boolean = false;
    methocarbamol: boolean = false;
}
export class OralAntipsychoticsModel{
    full: boolean = false;
    aripiprazole: boolean = false;
    quetiapine: boolean = false;
    risperidone: boolean = false;
    ziprasidone: boolean = false;
}
export class OralAntidepressantsModel{
    full: boolean = false;
    amitriptyline: boolean = false;
    citalopram: boolean = false;
    fluoxetine: boolean = false;
    nortriptyline: boolean = false;
    paroxetine: boolean = false;
    sertraline: boolean = false;
    venlafaxine: boolean = false;
    desmethylvenlafaxine: boolean = false;
    mirtazapine: boolean = false;
    trazodone: boolean = false;
}
export class OralStimulantsModel{
    full: boolean = false;
    methylphenidate: boolean = false; 
    ritalinicAcid: boolean = false; 
    mda: boolean = false; 
    phentermine: boolean = false;
}
export class OralKratomModel{
    full: boolean = false;
    mitragynine: boolean = false; 
}
export class OralNicotineModel{
    full: boolean = false;
    cotinine: boolean = false; 
}
export class OralOpioidAntagonistsModel{
    full: boolean = false;
    naloxone: boolean = false;   
    naltrexone: boolean = false;  
}
export class OralGabapentinoidsModel{
    full: boolean = false;
    gabapentin: boolean = false;
    pregabalin: boolean = false;
}
export class  OralDissociativeModel{
    full: boolean = false;
    ketamine: boolean = false;
    norketamine: boolean = false;
}
export class  OralOpioidAgonistsModel{
    full: boolean = false;
    buprenorphine: boolean = false;  
    norbuprenorphine: boolean = false;  
    codeine: boolean = false;
    dextromethorphan: boolean = false;
    hydrocodone: boolean = false;  
    norhydrocodone: boolean = false;
    hydromorphone: boolean = false; 
    fentanyl: boolean = false;  
    norfentanyl: boolean = false; 
    methadone: boolean = false;  
    eddp: boolean = false; 
    morphine: boolean = false;  
    oxycodone: boolean = false;  
    noroxycodone: boolean = false;  
    oxymorphone: boolean = false;  
    tapentadol: boolean = false; 
    tramadol: boolean = false;      
}

export class GPPModel
{
    gastrointestinal: boolean = false;
    helicobacter: boolean = false;
}
export class RPPModel
{
    swab: boolean = false;
    saliva: boolean = false;
    fullRespiratory: boolean = false;
    viralTargets: boolean = false;
    bacterialTargets: boolean = false;
    covidOnly: boolean = false;
    covidThenReflux: boolean = false;
    covidPlusModerate: boolean = false;
    moderateAssessment: boolean = false;
    influenzaA: boolean = false;
    influenzaB : boolean = false;
    parainfluenza: boolean = false;
    adenovirus: boolean = false;
    bocavirus: boolean = false;
    coronavirus: boolean = false;
    rhinovirus: boolean = false;
    parechovirus: boolean = false;
    respiratorySyncytial: boolean = false;
    metapneumovirus: boolean = false;
    mycoplasmaPneumoniae: boolean = false;
    chlamydiaPneumoniae: boolean = false;
    ctreptococcusPneumoniae: boolean = false;
    klebsiellaPneumoniae: boolean = false;
    haemophilusInfluenza: boolean = false;
    legionellaPneumophila: boolean = false;
    moraxellaCatarrhalis: boolean = false;
    bordatellaSpecies: boolean = false;
    staphlococcusAureus: boolean = false;
    covidParainfluenza: boolean = false;
    covidInfluenzaA: boolean = false;
    covidInfluenzaB: boolean = false;
    covidRespiratory: boolean = false;
    covidRhinovirus: boolean = false;
    covidStreptococcus: boolean = false;
    covidChlamydia: boolean = false;
    covidLegionella: boolean = false;
    covidHaemophilus: boolean = false;
}
export class UTIModel
{
    isPregnant: number = 0
    urine: boolean = false;
    swab: boolean = false

    uCommon: boolean = false
    uEnterococcusFaecalis: boolean = false;
    uEscherichiacoli: boolean = false;
    uKlebsiellaPneumoniae: boolean = false;
    uStaphylococcussaprophyticus: boolean = false;
    uStreptococcusAgalactiae: boolean = false;
    
    uUncommon: boolean = false;
    uEnterobacterCloacae: boolean = false;
    uEnterococcusFaecium: boolean = false;
    uGardnerellaVaginalis: boolean = false;
    uKlebsiellaOxytoca: boolean = false;
    uMycoplasmaHominis: boolean = false;
    uProteusMirabilis: boolean = false;
    uPseudomonasAeruginosa: boolean = false;
    uSerratiaMarcescens: boolean = false;
    uStaphylococcusAureus: boolean = false;

    uSTILeukorrhea: boolean = false;
    uChlamydiaTrachomatis: boolean = false;
    uSGardnerellaVaginalis: boolean = false;
    uMycoplasmaGenitalium: boolean = false;
    uSMycoplasmaHominis: boolean = false;
    uNeisseriaGonorrhoeae: boolean = false;
    uTrichomonasVaginalis: boolean = false;
    uUreaplasmaUrealyticum: boolean = false;

    uYeast: boolean = false;
    uCandidaAlbicans: boolean = false;
    uCandidaAuris: boolean = false;
    uCandidaGlabrata: boolean = false;
    uCandidaKrusei: boolean = false;
    uCandidaLusitaniae: boolean = false;
    uCandidaParapsilosis: boolean = false;
    uCandidaTropicalis: boolean = false;

    uAdditional: boolean = false;
    uAcinetobacterBaumanii: boolean = false;
    uActinotignumSchaalii: boolean = false;
    uAerococcusUrinae: boolean = false;
    uAlloscardoviaOmnicolens: boolean = false;
    uCitrobacterFreundii: boolean = false;
    uCitrobacterKoseri: boolean = false;
    uCorynebacteriumRiegelii: boolean = false;
    uKlebsiellaaerogenes: boolean = false;
    uMorganellaMorganii: boolean = false;
    uPantoeaAgglomerans: boolean = false;
    uProvidenciaStuartii: boolean = false;
    uStaphylococcusEpidermidis: boolean = false;
    uStaphylococcusHaemolyticus: boolean = false;
    uStaphylococcusLugdunensis: boolean = false;
    uStreptococcusAnginosus: boolean = false;
    uStreptococcusOralis: boolean = false;

    sSTI: boolean = false;
    sChlamydiaTrachomatis: boolean = false;
    sHPV16: boolean = false;
    sHPV18: boolean = false;
    sHPV31: boolean = false;
    sHPV33: boolean = false;
    sHSV1: boolean = false;
    sHSV2: boolean = false;
    sNeisseriaGonorrhoeae: boolean = false;
    sTreponemaPallidum: boolean = false;

    sBacterialVaginosis: boolean = false;
    sGardnerellaVaginalis: boolean = false;
    sMycoplasmaGenitalium: boolean = false;
    sMycoplasmaHominis: boolean = false;
    sTrichomonasVaginalis: boolean = false;
    sUreaplasmaUrealyticum: boolean = false;

    sYeast: boolean = false;
    sCandidaAlbicans: boolean = false;
    sCandidaAuris: boolean = false;
    sCandidaGlabrata: boolean = false;
    sCandidaKrusei: boolean = false;
    sCandidaLusitaniae: boolean = false;
    sCandidaParapsilosis: boolean = false;
    sCandidaTropicalis: boolean = false;

    sEmerging: boolean = false;
    sMpox: boolean = false;

}
