import { useEffect, useState } from 'react';
import { allOpportunities, opportunitiesList } from '../data/opportunities';

const API_URL = 'https://volunteery.cryck.workers.dev/';

const simpleRecommendations = (interests) => {
  if (!interests?.length) return allOpportunities;

  const normalized = interests.map((interest) => interest.toLowerCase());

  return allOpportunities
    .map((opportunity) => {
      const score =
        opportunity.interests?.reduce(
          (acc, interest) => (normalized.includes(interest.toLowerCase()) ? acc + 1 : acc),
          0,
        ) ?? 0;

      return {
        score,
        opportunity,
      };
    })
    .sort((a, b) => b.score - a.score)
    .map(({ opportunity }) => opportunity);
};

const getAIRecommendations = async (interests) => {
  const systemPrompt = `You are an AI assistant that ranks volunteer opportunities.
Given the user interests and a list of opportunities, return ONLY the JSON array
of indices (starting at 1) in order of relevance.
Example: [1,3,2,4]`;

  const userPrompt = `Interests: ${interests.join(', ')}

Opportunities: ${opportunitiesList}
Rank them from most to least relevant and reply with the JSON array only.`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 1200,
        temperature: 0.2,
      }),
    });

    const data = await response.json();

    if (data.choices && data.choices.length) {
      const raw = data.choices[0].message.content?.trim();
      if (!raw) throw new Error('Empty AI response');

      const ranking = JSON.parse(raw);
      return allOpportunities
        .map((opportunity, index) => ({
          ...opportunity,
          rank: ranking.indexOf(index + 1),
        }))
        .filter((item) => item.rank >= 0)
        .sort((a, b) => a.rank - b.rank)
        .slice(0, 3);
    }
  } catch (error) {
    console.error('AI recommendation failed, falling back to simple matching', error);
  }

  return simpleRecommendations(interests);
};

const recommendOpportunities = async (interests) => {
  if (!interests?.length) return allOpportunities;

  const recommended = await getAIRecommendations(interests);
  return recommended.length ? recommended : allOpportunities;
};

const Opportunities = ({ profile, onApply, defaultProfile }) => {
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    const loadRecommendations = async () => {
      setLoading(true);
      setError('');

      const interests = profile.interests?.filter(Boolean) ?? [];

      try {
        const results = await recommendOpportunities(interests);
        if (!ignore) {
          setRecommended(results);
        }
      } catch (err) {
        console.error('Unable to load recommendations', err);
        if (!ignore) {
          setRecommended(allOpportunities);
          setError('We had trouble loading AI recommendations, so we are showing everything instead.');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadRecommendations();

    return () => {
      ignore = true;
    };
  }, [profile]);

  const profileName = profile.name || defaultProfile?.name || 'Volunteer';

  return (
    <section className="opportunities-page">
      <h1>Volunteer Opportunities for {profileName}</h1>

      <div className="recommendations">
        <h2>Recommended for You</h2>
        {loading ? (
          <div className="loading">
            <p>Loading opportunities…</p>
            <div className="spinner" />
          </div>
        ) : (
          <OpportunityList opportunities={recommended} onApply={onApply} />
        )}
        {error && <p className="error">{error}</p>}
      </div>

      <div className="all-opportunities">
        <h2>All Opportunities</h2>
        <OpportunityList opportunities={allOpportunities} onApply={onApply} />
      </div>
    </section>
  );
};

const OpportunityList = ({ opportunities, onApply }) => {
  if (!opportunities.length) {
    return <p>No opportunities found matching your interests.</p>;
  }

  return (
    <div className="opportunities-list">
      {opportunities.map((opportunity) => (
        <OpportunityCard key={opportunity.id} opportunity={opportunity} onApply={onApply} />
      ))}
    </div>
  );
};

const OpportunityCard = ({ opportunity, onApply }) => (
  <div className="opportunity">
    <h3>{opportunity.title}</h3>
    <p>{opportunity.description}</p>
    <p>
      <strong>Location:</strong> {opportunity.location}
    </p>
    <p>
      <strong>Required Skills:</strong> {opportunity.skills.join(', ')}
    </p>
    <button type="button" onClick={() => onApply(opportunity)}>
      Apply
    </button>
  </div>
);

export default Opportunities;
