import './Opportunities.css';
import { allOpportunities } from '../data/opportunities';

const Opportunities = ({ profile = {}, onApply, defaultProfile }) => {
  const profileName = profile.name || defaultProfile?.name || 'Volunteer';

  return (
    <section className="opportunities-shell">
      <header className="opportunities-hero">
        <p className="eyebrow">All opportunities</p>
        <h1>Find the next place to lend a hand, {profileName}.</h1>
        <p>Browse every opportunity currently accepting volunteers and apply when one speaks to you.</p>
      </header>

      <div className="opportunities-list">
        {allOpportunities.map((opportunity) => (
          <OpportunityCard key={opportunity.id} opportunity={opportunity} onApply={onApply} />
        ))}
      </div>
    </section>
  );
};

const OpportunityCard = ({ opportunity, onApply }) => (
  <article className="opportunity-card">
    <div className="opportunity-card__icon" aria-hidden="true">
      <span />
    </div>
    <div className="opportunity-card__body">
      <div className="opportunity-card__header">
        <h3>{opportunity.title}</h3>
        <p className="opportunity-card__location">{opportunity.location}</p>
      </div>
      <p className="opportunity-card__description">{opportunity.description}</p>
      <div className="opportunity-card__skills">
        {opportunity.skills.map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>
    </div>
    <button className="opportunity-card__apply" type="button" onClick={() => onApply(opportunity)}>
      Apply
    </button>
  </article>
);

export default Opportunities;
